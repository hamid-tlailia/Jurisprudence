/** تصدير بطاقة الدرس صورةً أو PDF، ومشاركتها */

export async function nodeToPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  await document.fonts?.ready;
  // تمريرة أولى لتحميل الخطوط والصور في الذاكرة، ثم الرسم الفعلي
  await toPng(node, { pixelRatio: 1 }).catch(() => undefined);
  return toPng(node, { pixelRatio: 1, backgroundColor: "#f5f0e6" });
}

export async function downloadUrl(url: string, filename: string) {
  // نحوّل إلى رابط Blob ليحتفظ الملف باسمه في جميع المتصفحات
  const blob = await (await fetch(url)).blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: blob.type });
}

/** يحوّل صورة طويلة إلى PDF بمقاس A4، مقسّمة على صفحات */
export async function pngToPdf(dataUrl: string, filename: string) {
  const { jsPDF } = await import("jspdf");
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (img.height * pageW) / img.width;
  let y = 0;
  let page = 0;
  while (y < imgH) {
    if (page > 0) pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, -y, pageW, imgH, undefined, "FAST");
    y += pageH;
    page++;
  }
  pdf.save(filename);
}

export function slugify(s: string) {
  return s.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60) || "riwaq";
}
