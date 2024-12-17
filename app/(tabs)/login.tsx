import { StyleSheet, Text, TextInput, View, Button } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>התחברות</Text>
      <TextInput style={styles.input} placeholder="אימייל" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="סיסמה" secureTextEntry />
      <Button title="התחבר" onPress={() => alert('התחברת בהצלחה!')} />
      <Text style={styles.link}>עוד לא נרשמת? עבור לדף הרשמה</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
