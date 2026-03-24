import resend
from core.config import settings

resend.api_key = settings.resend_api_key


async def send_contact_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
    phone: str | None = None,
    company: str | None = None,
) -> bool:
    """
    Sends a notification email to Frandy when a contact form is submitted.
    Returns True on success, False on failure — never raises so the form
    submission still succeeds even if email delivery fails.
    """
    phone_line = f"<p><strong>Phone:</strong> {phone}</p>" if phone else ""
    company_line = f"<p><strong>Company:</strong> {company}</p>" if company else ""

    html_body = f"""
    <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #c0c0c0;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        {company_line}
        {phone_line}
        <hr style="border-color: #3a3a3a;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">{message}</p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": "frandy.dev <onboarding@resend.dev>",
            "to": settings.contact_email,
            "subject": f"[frandy.dev] {subject}",
            "html": html_body,
        })
        return True
    except Exception as e:
        print(f"[email] Failed to send notification: {e}")
        return False
