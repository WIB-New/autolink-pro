from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Agent


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'get_full_name', 'role', 'is_verified', 'is_active', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('AutoLink Info', {'fields': ('role', 'phone', 'avatar', 'is_verified', 'id_document', 'id_document_verified', 'date_of_birth', 'address')}),
    )


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'type', 'phone', 'rate', 'active', 'conversions', 'commission')
    list_filter = ('type', 'active')
    search_fields = ('code', 'name', 'phone')
    readonly_fields = ('code', 'conversions', 'total_amount', 'commission')
