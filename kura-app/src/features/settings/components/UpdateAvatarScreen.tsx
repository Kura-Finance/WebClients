import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

interface UpdateAvatarScreenProps {
  onClose: () => void;
}

export default function UpdateAvatarScreen({ onClose }: UpdateAvatarScreenProps) {
  const userProfile = useAppStore((state) => state.userProfile);
  const updateAvatar = useAppStore((state) => state.updateAvatar);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Logger.error('UpdateAvatarScreen', 'Failed to pick image', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Logger.error('UpdateAvatarScreen', 'Failed to take photo', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Logger.warn('UpdateAvatarScreen', 'No image selected');
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setIsLoading(true);
    Logger.info('UpdateAvatarScreen', 'Starting avatar save process', { selectedImage });
    
    try {
      // Convert image to base64 for upload
      Logger.debug('UpdateAvatarScreen', 'Fetching image from URI');
      const response = await fetch(selectedImage);
      Logger.debug('UpdateAvatarScreen', 'Fetch completed', { status: response.status, statusText: response.statusText });
      
      const blob = await response.blob();
      Logger.info('UpdateAvatarScreen', 'Blob created', { size: blob.size, type: blob.type });
      
      // Validate blob
      if (!blob || blob.size === 0) {
        const errorMsg = 'Image data is empty. Please select a valid image.';
        Logger.error('UpdateAvatarScreen', errorMsg, { blobSize: blob?.size });
        throw new Error(errorMsg);
      }
      
      Logger.debug('UpdateAvatarScreen', 'Starting FileReader conversion');
      
      // Use Promise wrapper for FileReader
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          try {
            const result = reader.result as string;
            Logger.debug('UpdateAvatarScreen', 'FileReader onloadend triggered', { resultLength: result?.length || 0 });
            
            // Validate base64 string
            if (!result || result.length === 0) {
              const errorMsg = 'Failed to convert image to base64';
              Logger.error('UpdateAvatarScreen', errorMsg, { result });
              reject(new Error(errorMsg));
              return;
            }
            
            Logger.info('UpdateAvatarScreen', 'Base64 conversion successful', { 
              length: result.length,
              prefix: result.substring(0, 80)
            });
            resolve(result);
          } catch (error) {
            Logger.error('UpdateAvatarScreen', 'Error in reader.onloadend', { error });
            reject(error);
          }
        };
        
        reader.onerror = () => {
          const errorMsg = 'Failed to read file';
          Logger.error('UpdateAvatarScreen', errorMsg, { readerError: reader.error });
          reject(new Error(errorMsg));
        };
        
        Logger.debug('UpdateAvatarScreen', 'Calling readAsDataURL');
        reader.readAsDataURL(blob);
      });
      
      Logger.info('UpdateAvatarScreen', 'About to upload avatar', { base64Length: base64String.length });
      
      // Upload to server via updateAvatar
      await updateAvatar(base64String);
      Logger.info('UpdateAvatarScreen', 'Avatar updated successfully');
      
      Alert.alert('Success', 'Avatar updated successfully', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
      Logger.error('UpdateAvatarScreen', 'Failed to update avatar', { 
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        fullError: error
      });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      Logger.debug('UpdateAvatarScreen', 'Avatar save process finished');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Update Avatar</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Avatar Preview */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Avatar Preview</Text>
        
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#1A1A24', alignItems: 'center', justifyContent: 'center', marginBottom: 32, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          {selectedImage ? (
            <Image 
              source={{ uri: selectedImage }} 
              style={{ width: '100%', height: '100%' }}
            />
          ) : userProfile.avatarUrl ? (
            <Image 
              source={{ uri: userProfile.avatarUrl }} 
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Ionicons name="person" size={48} color="#8B5CF6" />
          )}
        </View>

        {/* Action Buttons */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Select Image</Text>
        
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isLoading}
          style={{ width: '100%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1A1A24', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <Ionicons name="image" size={20} color="#8B5CF6" />
          <Text style={{ color: '#FFFFFF', fontWeight: '500', fontSize: 16 }}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={isLoading}
          style={{ width: '100%', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1A1A24', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <Ionicons name="camera" size={20} color="#8B5CF6" />
          <Text style={{ color: '#FFFFFF', fontWeight: '500', fontSize: 16 }}>Take a Photo</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !selectedImage}
          style={{ width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: isLoading || !selectedImage ? '#666666' : '#8B5CF6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Uploading...</Text>
            </>
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Save Avatar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
