let mergedContent = "";

// Add event listener to the file input to display a confirmation popup after file selection
document.getElementById("fileInput").addEventListener("change", () => {
  const files = document.getElementById("fileInput").files;
  if (files.length > 0) {
    alert("Files selected! Please click on the 'Merge Files' button to merge the content.");
  }
});

document.getElementById("mergeButton").addEventListener("click", async () => {
  const files = document.getElementById("fileInput").files;
  const output = document.getElementById("output");
  output.textContent = ""; // Clear previous output

  if (files.length === 0) {
    output.textContent = "Please select files or a folder to merge.";
    return;
  }

  mergedContent = ""; // Reset merged content

  // Process all files
  for (const file of files) {
    const fileType = file.type;
    const fileName = file.name.toLowerCase(); // Case-insensitive check for .sql

    if (fileType === "text/plain" || fileName.endsWith(".sql")) {
      const text = await readFileAsText(file);
      mergedContent += `----- ${file.name} -----\n` + text + "\n"; // Add a separator with filename
    } else if (fileType === "application/json") {
      const json = await readFileAsText(file);
      mergedContent += `----- ${file.name} -----\n` + JSON.stringify(JSON.parse(json), null, 2) + "\n";
    } else if (fileType === "application/xml" || fileType === "text/xml") {
      const xml = await readFileAsText(file);
      mergedContent += `----- ${file.name} -----\n` + formatXML(xml) + "\n";
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const jsonData = await readXLSXFile(file);
      mergedContent += `----- ${file.name} -----\n` + JSON.stringify(jsonData, null, 2) + "\n";
    } else {
      output.textContent += `Skipping unsupported file type: ${file.name}\n`;
    }

    mergedContent += "\n----- End of " + file.name + " -----\n"; // Add an end separator
  }

  output.textContent = mergedContent.trim(); // Remove trailing newline
});

document.getElementById("saveButton").addEventListener("click", () => {
  if (!mergedContent) {
    alert("No content to save. Please merge files first.");
    return;
  }

  const blob = new Blob([mergedContent], { type: "text/plain" });
  const uniqueNumber = Date.now(); // Unique number based on current timestamp
  const filename = `Merged_${uniqueNumber}.txt`;

  // Create a temporary link to download the file
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename; // Suggest the filename for download
  document.body.appendChild(link);
  link.click(); // Trigger the download
  document.body.removeChild(link); // Clean up
});

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (event) => reject(event.target.error);
    reader.readAsText(file);
  });
}

function formatXML(xml) {
  const formatted = xml.replace(/></g, ">\n<"); // Simple formatting
  return formatted;
}

async function readXLSXFile(file) {
  const data = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(data, { type: "array" });
  const jsonData = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );
  return jsonData;
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (event) => reject(event.target.error);
    reader.readAsArrayBuffer(file);
  });
}
