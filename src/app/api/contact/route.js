import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const requiredFields = ["name", "email", "subject", "message"];

export async function POST(request) {
  try {
    const body = await request.json();

    if (requiredFields.some((field) => typeof body?.[field] !== "string" || !body[field].trim())) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const email = body.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      process.env.SMTP_PASSWORD === "replace-with-your-gmail-app-password" ||
      !process.env.CONTACT_EMAIL
    ) {
      console.error("Contact email configuration is incomplete.");
      return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
    }

    const details = [
      `Name: ${body.name.trim()}`,
      `Email: ${email}`,
      `Phone: ${(body.phone || "Not provided").trim()}`,
      `Quantity: ${(body.quantity || "Not provided").trim()}`,
      "",
      body.message.trim()
    ].join("\n");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: body.subject.trim(),
      text: details
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact email error:", error);
    if (error?.code === "EAUTH") {
      return NextResponse.json({ error: "Email authentication failed. Check the Hostinger mailbox email and password." }, { status: 502 });
    }
    return NextResponse.json({ error: "The message could not be delivered. Please try again later." }, { status: 502 });
  }
}