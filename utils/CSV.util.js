export function csvToArray(text) {
  const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/,
    re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g,
    a = [];
  //Return NULL if input string is not well formed CSV string.
  if (!re_valid.test(text)) return null;
  text.replace(
    re_value,
    //"Walk" the string using replace with callback.
    (m0, m1, m2, m3) => {
      //Remove backslash from \' in single quoted values.
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      //Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      //Return empty string.
      return "";
    }
  );
  //Handle special case of empty last value.
  if (/,\s*$/.test(text)) a.push("");
  return a;
}

export const convertToCSV = (headers, items) => {
  const replacer = (key, value) => (value === null ? "" : value);
  const csv = [
    Object.values(headers).join(","), // header row first
    ...items.map((row) =>
      Object.keys(headers)
        .map((key) => JSON.stringify(row[key], replacer))
        .join(",")
    ),
  ].join("\r\n");
  return csv;
};
