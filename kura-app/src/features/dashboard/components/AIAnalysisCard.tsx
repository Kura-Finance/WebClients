import React from 'react';
import { View, Text } from 'react-native';
import type { AiInsight } from '../../../shared/store/useAppStore';

interface AIAnalysisCardProps {
  isAiOptedIn: boolean;
  aiInsights: AiInsight[];
}

export default function AIAnalysisCard({ isAiOptedIn, aiInsights }: AIAnalysisCardProps) {
  if (!isAiOptedIn) {
    return null;
  }

  return (
    <View className="rounded-[16px] bg-gradient-to-br from-[#1A1A24] to-[#2A2A2A] border border-[#8B5CF6]/20 p-5 mb-6">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#A78BFA] items-center justify-center">
          <Text className="text-sm">✨</Text>
        </View>
        <Text className="text-white text-lg font-bold">AI Analysis</Text>
      </View>

      <View className="space-y-4">
        {aiInsights.length > 0 ? (
          aiInsights.map((insight) => (
            <View key={insight.id}>
              <Text className="text-[#A78BFA] text-[11px] font-bold uppercase tracking-wider mb-2">{insight.title}</Text>
              <Text className="text-gray-300 text-sm leading-5">{insight.content}</Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 italic">No AI insights available yet.</Text>
        )}
      </View>
    </View>
  );
}
