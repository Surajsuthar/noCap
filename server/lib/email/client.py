from typing import List

import resend

from config import config


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


client = EmailClient(config.RESEND_API_KEY, config.RESEND_EMAIL)
