const axios = require("axios");
const parseXML = require("./xmlToJson");
const Job = require("../models/Job");
const ImportLog = require("../models/ImportLog");

// 🧹 Deep cleaner to remove invalid MongoDB keys like "$" or "."
function deepClean(data) {
  if (Array.isArray(data)) {
    return data.map(deepClean);
  } else if (data && typeof data === "object") {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      result[key] = deepClean(value);
    }
    return result;
  }
  if (typeof data === "string" || typeof data === "number") return data;
  return String(data ?? "");
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
      throw new Error("Invalid feed format — no <item> found");
    }

    console.log(`🧩 Total items fetched: ${items.length}`);

    let totalFetched = items.length;
    let totalImported = 0;
    let failedJobs = [];

    for (const [index, item] of items.entries()) {
      try {
        const cleanItem = deepClean(item);

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
          pubDate: new Date(cleanItem.pubDate || Date.now()),
          description:
            typeof cleanItem.description === "object"
              ? cleanItem.description._ ||
                JSON.stringify(cleanItem.description)
              : cleanItem.description || "",
        };

        if (!jobData.link || !jobData.title) continue;

        const finalData = deepClean(jobData);

        // 👀 Diagnostic Log: show first cleaned job only
        if (index === 0) {
          console.log("🧩 Sample Cleaned Job Data:");
          console.log(JSON.stringify(finalData, null, 2));
          console.log(
            "------------------------------------------------------------"
          );
        }

        await Job.findOneAndUpdate({ link: finalData.link }, finalData, {
          upsert: true,
          new: true,
        });

        totalImported++;
      } catch (jobError) {
        failedJobs.push({
          link: item.link,
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
    });

    console.log(`✅ Imported ${totalImported} jobs from ${feedUrl}`);
  } catch (err) {
    console.error(`❌ Error processing ${feedUrl}: ${err.message}`);
  }
};
