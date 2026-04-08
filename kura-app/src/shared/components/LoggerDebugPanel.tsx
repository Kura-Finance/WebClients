import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logger from '../utils/Logger';

interface LoggerDebugPanelProps {
  module?: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function LoggerDebugPanel({ module, isVisible, onClose }: LoggerDebugPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 只在 isVisible 为 true 时启动 interval
    if (!isVisible) {
      return;
    }

    const interval = setInterval(() => {
      const allLogs = Logger.getLogs({ module, limit: 50 });
      setLogs(allLogs);
    }, 500);

    return () => clearInterval(interval);
  }, [module, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingTop: 40,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Logger Debug Panel {module && `[${module}]`}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              padding: 8,
            }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        >
          {logs.length === 0 ? (
            <Text style={{ color: '#666666', fontSize: 12, marginTop: 16 }}>No logs yet...</Text>
          ) : (
            logs.map((log, idx) => (
              <View
                key={idx}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginVertical: 4,
                  borderRadius: 8,
                  backgroundColor:
                    log.level === 'error'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : log.level === 'warn'
                        ? 'rgba(250, 204, 21, 0.15)'
                        : log.level === 'debug'
                          ? 'rgba(96, 165, 250, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                  borderLeftWidth: 3,
                  borderLeftColor:
                    log.level === 'error'
                      ? '#EF4444'
                      : log.level === 'warn'
                        ? '#FACC15'
                        : log.level === 'debug'
                          ? '#60A5FA'
                          : '#22C55E',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
                    [{log.level.toUpperCase()}] {log.module}
                  </Text>
                  <Text style={{ color: '#999999', fontSize: 10 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={{ color: '#CCCCCC', fontSize: 11, marginTop: 4 }}>{log.message}</Text>
                {log.data && (
                  <Text style={{ color: '#999999', fontSize: 10, marginTop: 4 }}>
                    {JSON.stringify(log.data, null, 2).substring(0, 200)}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => Logger.clearLogs()}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Clear Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const exported = Logger.exportLogs();
              console.log('=== EXPORTED LOGS ===\n' + exported);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#8B5CF6', fontSize: 12, fontWeight: '600' }}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
