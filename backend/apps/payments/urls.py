from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet, PayoutViewSet, WalletViewSet, WithdrawalRequestViewSet,
    StripeReturnView, PayPalReturnView, StripeWebhookView,
    PaymentMethodsView, OrangeNotificationView, BookingPaymentStatusView,
    FinanceStatsView, FinanceTransactionListView, FinanceTransactionExportView,
    FinanceReportView,
)

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payouts', PayoutViewSet, basename='payout')
router.register(r'wallet', WalletViewSet, basename='wallet')
router.register(r'withdrawals', WithdrawalRequestViewSet, basename='withdrawal')

urlpatterns = [
    # Retours après paiement hébergé (Stripe Checkout / PayPal) + webhook
    path('stripe-return/', StripeReturnView.as_view(), name='stripe-return'),
    path('paypal-return/', PayPalReturnView.as_view(), name='paypal-return'),
    path('stripe-webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('methods/', PaymentMethodsView.as_view(), name='payment-methods'),
    path('orange-notification/', OrangeNotificationView.as_view(), name='orange-notification'),
    path('bookings/<str:reference>/status/', BookingPaymentStatusView.as_view(), name='booking-payment-status'),
    path('finance/stats/', FinanceStatsView.as_view(), name='finance-stats'),
    path('finance/transactions/export/', FinanceTransactionExportView.as_view(), name='finance-transactions-export'),
    path('finance/report/', FinanceReportView.as_view(), name='finance-report'),
    path('finance/transactions/', FinanceTransactionListView.as_view(), name='finance-transactions'),
    path('', include(router.urls)),
]
