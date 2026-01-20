import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function Prescriptions() {
    const { t } = useTranslation();
    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <Text className="text-xl font-bold text-gray-900">{t('prescriptions.title')}</Text>
            <Text className="text-gray-500 mt-2">Coming soon...</Text>
        </View>
    );
}
