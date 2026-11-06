def notif_allowed(user, channel, default=True):
    """Vérifie la préférence de notification de l'utilisateur.
    channel : 'sms' | 'whatsapp' | 'email' | 'push' — activé par défaut."""
    prefs = getattr(user, 'notif_prefs', None) or {}
    return bool(prefs.get(channel, default))


def notify_user(user, title, message):
    """Notification in-app (push) — ignorée si l'utilisateur a désactivé le push."""
    from apps.users.models import Notification
    if not notif_allowed(user, 'push'):
        return None
    return Notification.objects.create(user=user, title=title, message=message)
