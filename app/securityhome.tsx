import { router } from 'expo-router'
import React from 'react'
import { TouchableOpacity,Text } from 'react-native'
import { Button, Touchable } from 'react-native'
import { View,ScrollView } from 'react-native-reanimated/lib/typescript/Animated'

export default function securityhome() {
  return (
    <View>
        <TouchableOpacity
            onPress={() => router.push('/security')}
          >
            <Text>Go to Security</Text>
          </TouchableOpacity>
    </View>
  )
}
