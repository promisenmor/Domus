from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number', 'company', 'license_number']


        def validate_role(self, value):
            if value == 'ADMIN':
                raise serializers.ValidationError('You cannot register with ADMIN role')
            return value
        

        def create(self, validated_data):
            password = validated_data.pop(password)
            user = User(**validated_data)
            user.set_password(password)
            user.save()
            return user
        
    