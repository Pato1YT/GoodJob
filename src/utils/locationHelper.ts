import * as Location from 'expo-location';
import { Linking, Platform, Alert } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodedAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

/**
 * Solicita permisos de ubicación y obtiene las coordenadas GPS actuales del usuario
 */
export async function getCurrentUserLocation(): Promise<GeocodedAddress | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Se requieren permisos de ubicación para detectar tu domicilio automáticamente.'
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Realizar geocodificación inversa para obtener el nombre legible de la calle/colonia
    let street = '';
    let number = '';
    let neighborhood = '';
    let city = '';
    let state = '';
    let zipCode = '';
    let country = 'México';
    let formattedAddress = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const item = reverseGeocode[0];
        street = item.street || item.name || '';
        number = item.streetNumber || '';
        neighborhood = item.district || item.subregion || '';
        city = item.city || item.subregion || '';
        state = item.region || '';
        zipCode = item.postalCode || '';
        country = item.country || 'México';

        const parts = [
          street ? `${street}${number ? ` #${number}` : ''}` : '',
          neighborhood,
          city,
          state,
        ].filter(Boolean);

        if (parts.length > 0) {
          formattedAddress = parts.join(', ');
        }
      }
    } catch (reverseError) {
      console.warn('Error en geocodificación inversa:', reverseError);
    }

    return {
      street,
      number,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      formattedAddress,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Error al obtener ubicación actual:', error);
    Alert.alert('Error de ubicación', 'No fue posible obtener la ubicación del GPS.');
    return null;
  }
}

/**
 * Abre la app de navegación GPS nativa del trabajador (Google Maps, Apple Maps o Waze)
 * dirigida exactamente a las coordenadas o dirección del cliente.
 */
export function openNavigationToAddress(
  latitude?: number,
  longitude?: number,
  addressLabel?: string
) {
  if (latitude && longitude && (latitude !== 0 || longitude !== 0)) {
    // Si tenemos coordenadas GPS exactas, usamos navegación directa turn-by-turn
    const scheme = Platform.select({
      ios: `maps://app?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}&mode=d`,
    });

    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    if (scheme) {
      Linking.canOpenURL(scheme)
        .then((supported) => {
          if (supported) {
            Linking.openURL(scheme);
          } else {
            Linking.openURL(webFallback);
          }
        })
        .catch(() => Linking.openURL(webFallback));
    } else {
      Linking.openURL(webFallback);
    }
  } else if (addressLabel && addressLabel.trim().length > 0) {
    // Si solo hay texto de dirección sin coordenadas GPS
    const encoded = encodeURIComponent(addressLabel);
    const searchUrl = Platform.select({
      ios: `maps://app?q=${encoded}`,
      android: `geo:0,0?q=${encoded}`,
    }) || `https://www.google.com/maps/search/?api=1&query=${encoded}`;

    Linking.openURL(searchUrl).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
    });
  } else {
    Alert.alert(
      'Ubicación no disponible',
      'El cliente no ha registrado una dirección válida para este servicio.'
    );
  }
}
