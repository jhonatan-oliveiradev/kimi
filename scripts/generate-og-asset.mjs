import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("assets/orimae-og.b64");
const target = resolve("public/og/orimae-no-01.jpg");
const EXPECTED_BASE64_LENGTH = 31436;
const EXPECTED_BYTE_LENGTH = 23577;

const encoded = (await readFile(source, "utf8")).trim();

if (encoded.length !== EXPECTED_BASE64_LENGTH) {
  throw new Error(
    `Invalid ORIMAE OG source length: expected ${EXPECTED_BASE64_LENGTH}, got ${encoded.length}`
  );
}

const image = Buffer.from(encoded, "base64");

if (image.length !== EXPECTED_BYTE_LENGTH) {
  throw new Error(
    `Invalid ORIMAE OG output size: expected ${EXPECTED_BYTE_LENGTH} bytes, got ${image.length}`
  );
}

await mkdir(dirname(target), { recursive: true });
await writeFile(target, image);

console.log("Generated public/og/orimae-no-01.jpg (1200x630 JPEG)");
