import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../../../shared/store/notification';
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
} from '../../../shared/api/notificationApi';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const authToken = useAppStore((state) => state.authToken);
  const navigation = useNavigation<any>();
  const { width } = Dimensions.get('window');

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const setLoading = useNotificationStore((state) => state.setLoading);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!authToken) {
      Logger.warn('NotificationScreen', 'No auth token available');
      return;
    }

    try {
      setLoading(true);
      const response = await fetchNotifications(authToken, 50);
      setNotifications(response.notifications);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load notifications';
      Logger.error('NotificationScreen', 'Failed to load notifications', {
        error: errorMessage,
      });
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!authToken) return;

    try {
      markAsRead(notificationId);
      await markNotificationAsRead(authToken, notificationId);
    } catch (error) {
      Logger.error('NotificationScreen', 'Failed to mark as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!authToken) return;

    try {
      removeNotification(notificationId);
      await deleteNotification(authToken, notificationId);
    } catch (error) {
      Logger.error('NotificationScreen', 'Failed to delete notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!authToken || unreadCount === 0) return;

    try {
      const notificationStore = useNotificationStore.getState();
      notificationStore.markAllAsRead();
      await markAllNotificationsAsRead(authToken);
    } catch (error) {
      Logger.error('NotificationScreen', 'Failed to mark all as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return 'swap-horizontal';
      case 'account':
        return 'person';
      case 'price-alert':
        return 'trending-up';
      case 'system':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'transaction':
        return '#4ADE80';
      case 'account':
        return '#3B82F6';
      case 'price-alert':
        return '#F59E0B';
      case 'system':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => item.status === 'unread' && handleMarkAsRead(item.id)}
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor:
          item.status === 'unread' ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${getNotificationColor(item.type)}20`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={20}
          color={getNotificationColor(item.type)}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '600',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.status === 'unread' && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#8B5CF6',
                marginLeft: 8,
              }}
            />
          )}
        </View>
        <Text
          style={{
            color: '#999999',
            fontSize: 12,
            marginTop: 4,
          }}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text style={{ color: '#666666', fontSize: 11, marginTop: 4 }}>
          {getRelativeTime(item.timestamp)}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={{
          paddingLeft: 12,
          justifyContent: 'center',
        }}
      >
        <Ionicons name="close-circle" size={20} color="#666666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B0B0F',
        paddingTop: Math.max(insets.top, 10),
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>
            Notifications
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')}>
          <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: 16,
              alignSelf: 'flex-start',
            }}
          >
            <Text
              style={{
                color: '#8B5CF6',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}
        >
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color="#666666"
            style={{ marginBottom: 16 }}
          />
          <Text
            style={{
              color: '#999999',
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            No notifications yet
          </Text>
          <Text
            style={{
              color: '#666666',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            Check back later for updates about your accounts
          </Text>
        </View>
      )}
    </View>
  );
}
