from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


SUPPORTED_LANGUAGES = {'fr', 'en'}


def get_request_language(request):
    header = request.headers.get('Accept-Language', '') if request else ''
    for candidate in header.split(','):
        language = candidate.split(';', 1)[0].strip().split('-', 1)[0].lower()
        if language in SUPPORTED_LANGUAGES:
            return language
    return 'fr'


def get_user_language(user):
    language = getattr(user, 'language', 'fr')
    return language if language in SUPPORTED_LANGUAGES else 'fr'


def contact_acknowledgement(first_name, language='fr'):
    if language == 'en':
        return (
            'AutoLink Pro — We received your message',
            f"Hello {first_name},\n\n"
            "We have received your message and will get back to you as soon as possible.\n\n"
            "The AutoLink Pro team",
        )
    return (
        'AutoLink Pro — Demande bien reçue',
        f"Bonjour {first_name},\n\n"
        "Nous avons bien reçu votre message et vous répondrons "
        "dans les meilleurs délais.\n\nL'équipe AutoLink Pro",
    )


def render_email_template(template_name, context):
    """Render HTML email template with professional design"""
    html_content = render_to_string(f'emails/{template_name}.html', context)
    return html_content


def send_welcome_email(user):
    from apps.users.notif_utils import notif_allowed
    if not notif_allowed(user, 'email'):
        return
    if not user.email:
        return

    language = get_user_language(user)
    context = {
        'user': user,
        'first_name': user.first_name or user.username,
        'language': language,
        'logo_url': getattr(settings, 'SITE_URL', 'https://autolink-pro.worldwide-international.business') + '/static/logo.png',
    }

    if language == 'en':
        subject = 'Welcome to AutoLink Pro'
    else:
        subject = 'Bienvenue chez AutoLink Pro'

    html_message = render_email_template('welcome', context)

    message = (
        f"Hello {context['first_name']},\n\nWelcome to AutoLink Pro. Your account is ready."
        if language == 'en'
        else f"Bonjour {context['first_name']},\n\nBienvenue chez AutoLink Pro."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=True,
    )


def send_login_notification(user):
    from apps.users.notif_utils import notif_allowed
    if not notif_allowed(user, 'email'):
        return
    if not user.email:
        return

    language = get_user_language(user)
    context = {
        'user': user,
        'first_name': user.first_name or user.username,
        'language': language,
        'logo_url': getattr(settings, 'SITE_URL', 'https://autolink-pro.worldwide-international.business') + '/static/logo.png',
    }

    if language == 'en':
        subject = 'New sign-in to your AutoLink Pro account'
    else:
        subject = 'Nouvelle connexion à votre compte AutoLink Pro'

    html_message = render_email_template('login_notification', context)

    send_mail(
        subject=subject,
        message=f"Hello {context['first_name']},\n\nA sign-in to your AutoLink Pro account has just taken place.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=True,
    )
