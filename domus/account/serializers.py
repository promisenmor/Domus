from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=[
        ('AGENT', 'Agent'),
        ('CLIENT', 'Client'),
    ], required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number', 'company', 'license_number']


        def create(self, validated_data):
            role = validated_data('role')
            if role == ['ADMIN', 'CLIENT']:
                raise serializers.ValidationError("Invalid role for self-registration.")
            
            password = validated_data.pop(password)
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        
    