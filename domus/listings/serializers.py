from rest_framework import serializers
from . models import Property


class PropertySerializers(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['agent']

