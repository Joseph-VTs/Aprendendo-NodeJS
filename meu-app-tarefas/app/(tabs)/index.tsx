import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, Keyboard, Modal, 
  SafeAreaView, LayoutAnimation, Platform, UIManager
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buscarTarefas, salvarTarefa, excluirTarefa,
  atualizarTarefa, fazerLogin, cadastrarUsuario
} from '../../api';

// Configuração de animação para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [tarefas, setTarefas] = useState([]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novaTarefa, setNovaTarefa] = useState('');
  const [modoLogin, setModoLogin] = useState(true);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    verificarAcesso();
  }, []);

  async function verificarAcesso() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLogado(true);
        await carregarDados();
      }
    } catch (err) {
      console.log("Erro de acesso:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDados() {
    try {
      const dados = await buscarTarefas();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTarefas(dados);
    } catch (err) {
      await AsyncStorage.removeItem('token');
      setLogado(false);
    }
  }

  async function handleAdd() {
    if (!novaTarefa.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await salvarTarefa(novaTarefa);
    setNovaTarefa('');
    Keyboard.dismiss();
    await carregarDados();
  }

  async function handleToggle(item) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await atualizarTarefa(item.id, item.texto, item.concluida ? 0 : 1);
    await carregarDados();
  }

  async function handleDelete(id) {
    Alert.alert("Excluir", "Apagar permanentemente?", [
      { text: "Não" },
      { text: "Sim", onPress: async () => { 
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          await excluirTarefa(id); 
          carregarDados(); 
        } 
      }
    ]);
  }

  async function salvarEdicao() {
    if (!textoEdicao.trim()) return;
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await atualizarTarefa(tarefaParaEditar.id, textoEdicao, tarefaParaEditar.concluida);
      setModalEditarVisivel(false);
      await carregarDados();
    } catch (err) {
      Alert.alert("Erro", "Falha na edição.");
    }
  }

  function abrirEdicao(item) {
    setTarefaParaEditar(item);
    setTextoEdicao(item.texto);
    setModalEditarVisivel(true);
  }

  if (carregando && !logado) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 15, color: '#4F46E5', fontWeight: '600' }}>
          Sincronizando com a nuvem...
        </Text>
      </View>
    );
  }

  if (!logado) {
    return (
      <View style={styles.container}>
        <Text style={styles.tituloApp}>To-Do Cloud 🚀</Text>
        <View style={styles.cardLogin}>
          <Text style={styles.label}>{modoLogin ? 'Acesse sua conta' : 'Crie seu perfil'}</Text>
          <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
          <TouchableOpacity style={styles.botaoPrincipal} onPress={async () => {
              const res = modoLogin ? await fazerLogin(email, senha) : await cadastrarUsuario(email, senha);
              if (res.ok) {
                if (!modoLogin) { Alert.alert("Sucesso", "Conta criada! Faça login."); setModoLogin(true); }
                else { const d = await res.json(); await AsyncStorage.setItem('token', d.token); setLogado(true); carregarDados(); }
              } else { Alert.alert("Erro", "Verifique os dados."); }
          }}>
            <Text style={styles.botaoTexto}>{modoLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop: 15}} onPress={() => setModoLogin(!modoLogin)}>
            <Text style={{color: '#4F46E5', textAlign: 'center'}}>{modoLogin ? 'Criar uma conta' : 'Já tenho conta'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloApp}>Minhas Tarefas</Text>
        <TouchableOpacity onPress={async () => { await AsyncStorage.removeItem('token'); setLogado(false); }}>
          <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="O que vamos fazer?"
          value={novaTarefa}
          onChangeText={setNovaTarefa}
        />
        <TouchableOpacity style={styles.botaoAdd} onPress={handleAdd}>
          <Text style={styles.botaoTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemTarefa}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => handleToggle(item)}>
              <Text style={[styles.textoTarefa, item.concluida && styles.textoRiscado]}>
                {item.texto}
              </Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity onPress={() => abrirEdicao(item)}><Text style={styles.emoji}>✏️</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.emoji}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalEditarVisivel} animationType="fade" transparent={true}>
        <View style={styles.modalFundo}>
          <View style={styles.modalConteudo}>
            <Text style={styles.modalTitulo}>Editar Tarefa</Text>
            <TextInput style={styles.input} value={textoEdicao} onChangeText={setTextoEdicao} autoFocus />
            <View style={styles.modalBotoes}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalEditarVisivel(false)}>
                <Text style={{ color: '#64748b' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  tituloApp: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#475569' },
  cardLogin: { backgroundColor: '#fff', padding: 25, borderRadius: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  input: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 15, borderColor: '#e2e8f0', borderWidth: 1 },
  inputArea: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  botaoAdd: { backgroundColor: '#4F46E5', width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  botaoPrincipal: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemTarefa: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, borderLeftWidth: 6, borderLeftColor: '#4F46E5' },
  textoTarefa: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  textoRiscado: { textDecorationLine: 'line-through', color: '#94a3b8', opacity: 0.5 },
  emoji: { fontSize: 20 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalConteudo: { backgroundColor: '#fff', width: '85%', padding: 30, borderRadius: 24 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  btnCancelar: { padding: 12 },
  btnSalvar: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 }
});