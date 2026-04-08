import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, Keyboard, Modal, 
  LayoutAnimation, Platform, UIManager
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buscarTarefas, salvarTarefa, excluirTarefa,
  atualizarTarefa, fazerLogin, cadastrarUsuario
} from '../../api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [tarefas, setTarefas] = useState([]);
  
  const [nome, setNome] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoLogin, setModoLogin] = useState(true);
  const [lembrarMe, setLembrarMe] = useState(true); // 👈 Nova caixinha começa marcada

  const [novaTarefa, setNovaTarefa] = useState('');
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    verificarAcesso();
  }, []);

  async function verificarAcesso() {
    try {
      const token = await AsyncStorage.getItem('token');
      const nomeSalvo = await AsyncStorage.getItem('userNome');

      if (token) {
        setLogado(true);
        if (nomeSalvo) setNomeUsuario(nomeSalvo);
        await carregarDados();
      }
    } catch (err) {
      console.log("Erro ao recuperar sessão:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Não" },
      { 
        text: "Sim", 
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'userNome']); 
          setLogado(false);
          setTarefas([]);
          setNomeUsuario('Usuário');
        }
      }
    ]);
  }

  // --- LÓGICA DE LOGIN COM ERROS ESPECÍFICOS ---
  async function realizarAcao() {
    try {
      const res = modoLogin 
        ? await fazerLogin(email, senha) 
        : await cadastrarUsuario(nome, email, senha);

      const dados = await res.json();

      if (res.ok) {
        if (!modoLogin) {
          Alert.alert("Sucesso", "Conta criada com sucesso!");
          setModoLogin(true);
        } else {
          // 🛡️ SÓ SALVA NO ASYNCSTORAGE SE "LEMBRAR ME" ESTIVER ATIVO
          if (lembrarMe) {
            await AsyncStorage.setItem('token', dados.token);
            await AsyncStorage.setItem('userNome', dados.nome);
          }
          
          setNomeUsuario(dados.nome);
          setLogado(true);
          await carregarDados();
        }
      } else {
        // 🚩 MENSAGENS ESPECÍFICAS VINDO DO BACKEND
        Alert.alert("Atenção", dados.erro || "Erro na operação.");
      }
    } catch (err) {
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }

  async function carregarDados() {
    try {
      const dados = await buscarTarefas();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTarefas(dados);
    } catch (err) {
      setLogado(false);
    }
  }

  // ... (Funções handleAdd, handleToggle, handleDelete, salvarEdicao permanecem iguais)
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

  if (carregando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 15, color: '#4F46E5', fontWeight: '600' }}>Sincronizando...</Text>
      </View>
    );
  }

  if (!logado) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.tituloApp}>To-Do Cloud 🚀</Text>
          <View style={styles.cardLogin}>
            <Text style={styles.label}>{modoLogin ? 'Acesse sua conta' : 'Crie seu perfil'}</Text>
            
            {!modoLogin && (
              <TextInput style={styles.input} placeholder="Seu nome" value={nome} onChangeText={setNome} />
            )}

            <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

            {/* ✅ CAIXINHA "LEMBRAR ME" */}
            {modoLogin && (
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setLembrarMe(!lembrarMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, lembrarMe && styles.checkboxChecked]}>
                  {lembrarMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Lembrar meu login</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.botaoPrincipal} onPress={realizarAcao}>
              <Text style={styles.botaoTexto}>{modoLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setModoLogin(!modoLogin)}>
              <Text style={{ color: '#4F46E5', textAlign: 'center', fontWeight: '500' }}>
                {modoLogin ? 'Ainda não tem conta? Clique aqui' : 'Já tenho conta, quero entrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.tituloApp}>Minhas Tarefas</Text>
            <Text style={{ color: '#64748b' }}>Organize seu dia, {nomeUsuario}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.btnSair}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputArea}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="O que vamos fazer?" value={novaTarefa} onChangeText={setNovaTarefa} />
          <TouchableOpacity style={styles.botaoAdd} onPress={handleAdd}>
            <Text style={styles.botaoTexto}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.itemTarefa}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => handleToggle(item)}>
                <Text style={[styles.textoTarefa, item.concluida && styles.textoRiscado]}>{item.texto}</Text>
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 20, paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25, marginTop: 20 },
  tituloApp: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  btnSair: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 8 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#475569' },
  cardLogin: { backgroundColor: '#fff', padding: 25, borderRadius: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  input: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, fontSize: 16, marginBottom: 15, borderColor: '#e2e8f0', borderWidth: 1 },
  
  // Estilos da Caixinha (Checkbox)
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginLeft: 5 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: '#4F46E5' },
  checkboxInner: { width: 10, height: 10, backgroundColor: '#fff', borderRadius: 2 },
  checkboxLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },

  inputArea: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  botaoAdd: { backgroundColor: '#4F46E5', width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  botaoPrincipal: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 16, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemTarefa: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, borderLeftWidth: 6, borderLeftColor: '#4F46E5' },
  textoTarefa: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  textoRiscado: { textDecorationLine: 'line-through', color: '#94a3b8', opacity: 0.5 },
  emoji: { fontSize: 20 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalConteudo: { backgroundColor: '#fff', width: '85%', padding: 30, borderRadius: 24 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  btnCancelar: { padding: 12 },
  btnSalvar: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 }
});