const xml2js = require("xml2js");

// 🧹 Fully safe XML parser — removes $ keys and unwraps nested objects
const parseXML = async (xml) => {
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitRoot: false,
    trim: true,
  });

  const raw = await parser.parseStringPromise(xml);

  const clean = (data) => {
    if (Array.isArray(data)) {
      return data.map(clean);
    } else if (data && typeof data === "object") {
      const cleaned = {};
      for (const key in data) {
        if (key.startsWith("$")) continue; // 🚫 skip illegal MongoDB keys
        const value = clean(data[key]);
        // unwrap single-key objects like { _: "text" } or { "#text": "text" }
        if (
          typeof value === "object" &&
          value !== null &&
          Object.keys(value).length === 1 &&
          (value._ || value["#text"])
        ) {
          cleaned[key] = value._ || value["#text"];
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    }
    return data;
  };

  return clean(raw);
};

module.exports = parseXML;
