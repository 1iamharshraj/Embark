import { createCanvas } from "canvas";

export interface CertificateInput {
  type: "participation" | "winner";
  competitionTitle: string;
  teamName: string;
  names: string[];
  rank?: number;
  date: string;
}

const WIDTH = 1120;
const HEIGHT = 784;

export function generateCertificate(input: CertificateInput): Buffer {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#F4F7FC");
  gradient.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Border
  ctx.strokeStyle = "#2E6BFF";
  ctx.lineWidth = 8;
  ctx.strokeRect(24, 24, WIDTH - 48, HEIGHT - 48);
  ctx.strokeStyle = "#0B1F3A";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, WIDTH - 72, HEIGHT - 72);

  // Header
  ctx.fillStyle = "#0B1F3A";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EMBARK INDIA", WIDTH / 2, 110);

  ctx.fillStyle = "#2E6BFF";
  ctx.font = "24px sans-serif";
  ctx.fillText("CASE COMPETITION CERTIFICATE", WIDTH / 2, 150);

  // Title line
  ctx.fillStyle = "#161616";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("This certifies that", WIDTH / 2, 210);

  // Team name
  ctx.font = "bold 40px sans-serif";
  ctx.fillText(input.teamName, WIDTH / 2, 270);

  // Names
  ctx.font = "22px sans-serif";
  const namesText = input.names.join("  ·  ");
  ctx.fillText(namesText, WIDTH / 2, 320);

  // Competition
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "#6B7280";
  ctx.fillText("participated in", WIDTH / 2, 380);

  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = "#161616";
  const title = input.competitionTitle.length > 60 ? input.competitionTitle.slice(0, 60) + "…" : input.competitionTitle;
  ctx.fillText(title, WIDTH / 2, 420);

  // Rank badge for winners
  let yOffset = 470;
  if (input.type === "winner" && input.rank) {
    const badge = `${rankSuffix(input.rank)} Place`;
    ctx.fillStyle = "#2E6BFF";
    ctx.fillRect(WIDTH / 2 - 110, 450, 220, 46);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(badge, WIDTH / 2, 480);
    yOffset = 520;
  }

  // Date
  ctx.fillStyle = "#6B7280";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Date: ${input.date}`, WIDTH / 2, yOffset);

  // Footer
  ctx.fillStyle = "#0B1F3A";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText("Embark India — Compete. Learn. Advance.", WIDTH / 2, HEIGHT - 60);

  return canvas.toBuffer("image/png");
}

function rankSuffix(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}
