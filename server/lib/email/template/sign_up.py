from html import escape


def sign_up_template(name: str, verification_link: str) -> str:
    safe_name = escape(name)
    safe_link = escape(verification_link, quote=True)

    return f"""
        <h1>Welcome, {safe_name}!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="{safe_link}">Verify Email</a>
    """
