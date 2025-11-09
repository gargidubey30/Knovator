const axios = require("axios");
const parseXML = require("./xmlToJson");
const Job = require("../models/Job");
const ImportLog = require("../models/ImportLog");

// 🧹 Deep cleaner to remove invalid MongoDB keys like "$" or "."
function deepClean(data) {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(deepClean);
  }
  
  if (typeof data === "object") {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip keys starting with $ or containing .
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      result[key] = deepClean(value);
    }
    return result;
  }
  
  // Return primitives as-is
  return data;
}

exports.fetchAndImport = async (feedUrl) => {
  console.log(`📥 Fetching feed from: ${feedUrl}`);

  try {
    const response = await axios.get(feedUrl);
    const json = await parseXML(response.data);

    // Handle different RSS/Atom feed structures
    const items =
      json?.rss?.channel?.item ||
      json?.channel?.item ||
      json?.item ||
      [];

    if (!Array.isArray(items)) {
      throw new Error("Invalid feed format – no <item> found");
    }

    console.log(`🧩 Total items fetched: ${items.length}`);

    let totalFetched = items.length;
    let totalImported = 0;
    let failedJobs = [];

    for (const [index, item] of items.entries()) {
      try {
        const cleanItem = deepClean(item);

        // Extract pubDate - handle objects, strings, or missing dates
        let pubDateValue = cleanItem.pubDate;
        if (typeof pubDateValue === "object" && pubDateValue !== null) {
          // If it's an object, try to extract text value
          pubDateValue = pubDateValue._ || pubDateValue["#text"] || null;
        }
        // If still invalid, use current date
        if (!pubDateValue || pubDateValue === "" || typeof pubDateValue === "object") {
          pubDateValue = new Date();
        } else {
          pubDateValue = new Date(pubDateValue);
          // Check if date is valid
          if (isNaN(pubDateValue.getTime())) {
            pubDateValue = new Date();
          }
        }

        const jobData = {
          title:
            typeof cleanItem.title === "object"
              ? cleanItem.title._ || JSON.stringify(cleanItem.title)
              : cleanItem.title || "Untitled Job",
          link: cleanItem.link || "",
          company:
            cleanItem["source"] ||
            cleanItem["author"] ||
            cleanItem["dc:creator"] ||
            "Unknown",
          pubDate: pubDateValue,
          description:
            typeof cleanItem.description === "object"
              ? cleanItem.description._ ||
                JSON.stringify(cleanItem.description)
              : cleanItem.description || "",
        };

        if (!jobData.link || !jobData.title) continue;

       // const finalData = deepClean(jobData);

        // 👀 Diagnostic Log: show first cleaned job only
        if (index === 0) {
          console.log("🧩 Sample Cleaned Job Data:");
          console.log(JSON.stringify(jobData, null, 2));
          console.log(
            "------------------------------------------------------------"
          );
        }

        await Job.findOneAndUpdate({ link: jobData.link }, jobData, {
          upsert: true,
          new: true,
        });

        totalImported++;
      } catch (jobError) {
        failedJobs.push({
          link: item.link || "unknown",
          reason: jobError.message,
        });
        console.error(`❌ Failed to import job: ${jobError.message}`);
      }
    }

    await ImportLog.create({
      fileName: feedUrl,
      totalFetched,
      totalImported,
      newJobs: totalImported,
      updatedJobs: 0,
      failedJobs,
      status: failedJobs.length > 0 && totalImported === 0 ? "failed" : "success",
    });

    console.log(`✅ Imported ${totalImported} jobs from ${feedUrl}`);
  } catch (err) {
    console.error(`❌ Error processing ${feedUrl}: ${err.message}`);
    
    // Log the failed import
    await ImportLog.create({
      fileName: feedUrl,
      totalFetched: 0,
      totalImported: 0,
      newJobs: 0,
      updatedJobs: 0,
      failedJobs: [{ link: feedUrl, reason: err.message }],
      status: "failed",
    });
    
    throw err; // Re-throw to let worker know it failed
  }
};