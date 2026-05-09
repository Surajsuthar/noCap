from celery import Celery

from config import config

celery = Celery(
    broker=config._get_redis(),
    backend=config._get_redis(),
)


@celery.tasks
def send_vefication_email():
    pass


@celery.tasks
def send_login_otp():
    pass
