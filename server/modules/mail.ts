import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    // If no credentials provided, just log for dev
    if (!process.env.SMTP_USER) {
      console.log(`[MAIL MOCK] To: ${to}, Subject: ${subject}`);
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Echo Platform" <no-reply@echo.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Mail Error:", error);
  }
};

export const notifyComment = async (ownerEmail: string, storyTitle: string, commenterName: string) => {
  await sendMail(
    ownerEmail,
    `New comment on your story: ${storyTitle}`,
    `<h1>Hello!</h1><p><strong>${commenterName}</strong> just commented on your story "<em>${storyTitle}</em>".</p>`
  );
};

export const notifyVote = async (ownerEmail: string, storyTitle: string, voterName: string, voteType: string) => {
  await sendMail(
    ownerEmail,
    `Your story got a ${voteType.toLowerCase()}: ${storyTitle}`,
    `<h1>Hello!</h1><p><strong>${voterName}</strong> just ${voteType.toLowerCase()}d your story "<em>${storyTitle}</em>".</p>`
  );
};
