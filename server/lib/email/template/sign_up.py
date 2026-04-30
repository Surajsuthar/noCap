def sign_up_template(name: str, verification_link: str) -> str:
    return f"""
        <h1>Welcome, {name}!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="{verification_link}">Verify Email</a>
    """
