from html import escape


def login_otp(name: str, otp : str ) -> str:
    safe_name = escape(name)
    safe_otp = escape(otp)

    return f"""
        <h1>Welcome, {safe_name}!</h1>
        <p>Please click the link below to verify your email:</p>
        <p>Your OTP is: {safe_otp}</p>
    """
