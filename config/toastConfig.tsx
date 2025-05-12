import { BaseToast, ErrorToast, BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#34D399' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: 'bold',
        color: '#065F46',
      }}
      text2Style={{
        fontSize: 16,
        color: '#065F46',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#F87171' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'semibold',
        color: '#991B1B',
      }}
      text2Style={{
        fontSize: 16,
        color: '#991B1B',
      }}
    />
  ),
};