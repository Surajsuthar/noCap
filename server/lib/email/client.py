from typing import List

import resend

from config import config
from lib.email.template.otp_tem import login_otp
from lib.email.template.sign_up import sign_up_template


class EmailClient:
    def __init__(self, api_key: str, from_email: str):
        resend.api_key = api_key
        self._from_email = from_email

    def _send_email(self, to: List[str], subject: str, html: str):
        params: resend.Emails.SendParams = {
            "from": self._from_email,
            "to": to,
            "subject": subject,
            "html": html,
        }

        return resend.Emails.send(params)

    def send_magic_link(self, *, to: str, name: str, magic_link: str):
        return self._send_email(
            to=[to],
            subject="Your NoCap magic link",
            html=sign_up_template(name=name, verification_link=magic_link),
        )

    def send_otp(self, *, to: str, name: str, otp: str):
        return self._send_email(
            to=[to],
            subject="Your NoCap OTP",
            html=login_otp(name=name, otp=otp),
        )


client = EmailClient(config.RESEND_API_KEY, config.RESEND_EMAIL)
