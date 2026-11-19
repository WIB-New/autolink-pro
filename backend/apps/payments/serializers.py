from decimal import Decimal
from rest_framework import serializers
from .models import Payment, Payout, WalletTransaction, WithdrawalRequest

TOPUP_METHODS = ['mtn', 'orange', 'paypal', 'stripe']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payer', 'commission', 'owner_payout', 'paid_at', 'payout_done',
                            'payout_at', 'created_at', 'provider_ref', 'provider_status',
                            'provider_token', 'provider_pay_token']

    def create(self, validated_data):
        booking = validated_data['booking']
        validated_data['amount'] = booking.subtotal
        validated_data['commission'] = booking.commission_amount
        validated_data['owner_payout'] = booking.owner_amount
        return super().create(validated_data)


class PayoutSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    recipient_email = serializers.EmailField(source='recipient.email', read_only=True)

    class Meta:
        model = Payout
        fields = [
            'id', 'payment', 'recipient', 'recipient_name', 'recipient_email',
            'amount', 'method', 'status', 'transaction_ref', 'processed_at', 'created_at',
        ]
        read_only_fields = ['processed_at', 'created_at']

    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name() or obj.recipient.username


class FinanceTransactionSerializer(serializers.ModelSerializer):
    reference = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    client_email = serializers.EmailField(source='payer.email', read_only=True)
    vehicle = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'reference', 'client_name', 'client_email', 'vehicle',
            'method', 'status', 'amount', 'commission', 'owner_payout',
            'created_at', 'paid_at',
        ]

    def get_reference(self, obj):
        return obj.transaction_ref or f'PAY-{obj.pk:04d}'

    def get_client_name(self, obj):
        return obj.payer.get_full_name() or obj.payer.username

    def get_vehicle(self, obj):
        vehicle = obj.booking.vehicle
        return f'{vehicle.brand} {vehicle.model} ({vehicle.plate})'


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'kind', 'method', 'amount', 'balance_after', 'reference', 'note',
                  'status', 'provider_status', 'created_at']


class WithdrawalRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    user_balance = serializers.DecimalField(source='user.balance', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'reference', 'user', 'user_name', 'user_email', 'user_role', 'user_balance',
                  'amount', 'method', 'phone', 'status', 'admin_note', 'processed_at', 'created_at']
        read_only_fields = ['id', 'reference', 'user', 'status', 'admin_note', 'processed_at', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def validate_amount(self, value):
        from apps.users.models import PlatformSettings
        cfg = PlatformSettings.current()
        if value < cfg.min_withdrawal_amount:
            raise serializers.ValidationError(
                f'Montant minimum de retrait : {cfg.min_withdrawal_amount:.0f} FCFA.')
        if cfg.max_withdrawal_amount and value > cfg.max_withdrawal_amount:
            raise serializers.ValidationError(
                f'Montant maximum par retrait : {cfg.max_withdrawal_amount:.0f} FCFA.')
        return value


class TopUpSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('500'))
    method = serializers.ChoiceField(choices=TOPUP_METHODS)
    phone = serializers.CharField(required=False, allow_blank=True)
