import puppeteer from "puppeteer";
import fs from "fs";

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

console.log("Navigating to Udyam form...");
await page.goto("https://udyamregistration.gov.in/UdyamRegistration.aspx", {
  waitUntil: "networkidle2",
});

console.log("Extracting Step 1 fields...");
let step1Fields = await page.evaluate(() => {
  const formFields = [];

  document.querySelectorAll(".form-group").forEach((group) => {
    const labelEl = group.querySelector("label");
    const inputEl = group.querySelector("input, select");

    if (!labelEl || !inputEl) return;
    if (inputEl.type === "hidden") return;
    if (inputEl.name?.startsWith("__")) return;

    const labelText = labelEl.innerText.trim();
    let isRequired =
      labelText.includes("*") ||
      inputEl.classList.contains("mandatory") ||
      inputEl.getAttribute("aria-required") === "true" ||
      group.querySelector("span[id*='RequiredFieldValidator']")?.style.display !== "none";

    formFields.push({
      name: inputEl.name || inputEl.id,
      type: inputEl.tagName.toLowerCase(),
      inputType: inputEl.type || "text",
      placeholder: inputEl.placeholder || "",
      label: labelText.replace("*", "").trim(),
      required: isRequired,
      maxlength: inputEl.maxLength > 0 ? inputEl.maxLength : null
    });
  });

  return formFields;
});

// Add regex rules + force required for Aadhaar and Name
step1Fields = step1Fields.map(field => {
  if (field.label.includes("Aadhaar") || field.name.includes("adharno")) {
    return {
      ...field,
      required: true,
      validation: {
        regex: "^[0-9]{12}$",
        errorMessage: "Aadhaar number must be exactly 12 digits."
      }
    };
  }
  if (field.label.includes("Name") || field.name.includes("ownername")) {
    return {
      ...field,
      required: true,
      validation: {
        regex: "^[A-Za-z ]+$",
        errorMessage: "Name must contain only letters and spaces."
      }
    };
  }
  return field;
});

fs.writeFileSync("step1.json", JSON.stringify(step1Fields, null, 2));
console.log("✅ Step 1 fields with validation rules saved to step1.json");

await browser.close();
