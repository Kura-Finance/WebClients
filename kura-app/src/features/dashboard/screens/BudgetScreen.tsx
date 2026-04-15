import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function BudgetScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [budgets, setBudgets] = useState([
    { id: '1', category: 'Food & Dining', limit: 500, spent: 245, color: '#FF6B6B' },
    { id: '2', category: 'Transportation', limit: 200, spent: 120, color: '#4ECDC4' },
    { id: '3', category: 'Entertainment', limit: 150, spent: 95, color: '#95E1D3' },
  ]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const renderBudgetItem = (budget: any) => {
    const percentage = (budget.spent / budget.limit) * 100;
    const progressColor = percentage > 90 ? '#FF6B6B' : percentage > 70 ? '#FFA726' : '#4ADE80';

    return (
      <View
        key={budget.id}
        style={{
          backgroundColor: '#1A1A24',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header: Category & Amount */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: budget.color + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: budget.color,
                }}
              />
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 }}>
              {budget.category}
            </Text>
          </View>
          <Text style={{ color: '#999999', fontSize: 12, fontWeight: '500' }}>
            ${budget.spent} / ${budget.limit}
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: progressColor,
              borderRadius: 4,
            }}
          />
        </View>

        {/* Remaining Amount */}
        <Text style={{ color: '#999999', fontSize: 11, fontWeight: '500' }}>
          ${Math.max(budget.limit - budget.spent, 0)} remaining
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#1A1A24',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Budget</Text>
        <TouchableOpacity
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#1A1A24',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, paddingBottom: 100 }}
      >
        {/* Summary Card */}
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: '#1A1A24',
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, color: '#CCCCCC', fontWeight: '600', marginBottom: 4 }}>
              Total Budget
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF' }}>
              ${totalBudget}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#CCCCCC', fontWeight: '600', marginBottom: 4 }}>
                Spent
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#FFFFFF' }}>
                ${totalSpent}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: '#CCCCCC', fontWeight: '600', marginBottom: 4 }}>
                Remaining
              </Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#4ADE80' }}>
                ${remainingBudget}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Budget List */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
            Categories
          </Text>
          {budgets.map((budget) => renderBudgetItem(budget))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
