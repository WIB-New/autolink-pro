"""Backend email de dev : affiche un résumé lisible dans le terminal
(sujet + corps texte) au lieu du dump MIME complet du backend console Django."""
from django.core.mail.backends.console import EmailBackend as BaseConsoleBackend


class ConsoleBackend(BaseConsoleBackend):
    def write_message(self, message):
        body = (message.body or '').strip()
        if not body and message.alternatives:
            body = message.alternatives[0][0]
        print(
            f'\n[EMAIL] To: {", ".join(message.to or [])}\n'
            f'Subject: {message.subject}\n'
            f'{body}\n'
        )
