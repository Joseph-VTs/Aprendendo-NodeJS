import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, Keyboard, Modal, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 ATENÇÃO AO IMPORT: Se o api.js estiver na pasta 'meu-app-tarefas', 
// e este arquivo em 'app/index.tsx', use '../api'.
// Se este arquivo estiver em 'app/(tabs)/index.tsx', use '../../api'.
import {
  buscarTarefas, salvarTarefa, excluirTarefa,
  atualizarTarefa, fazerLogin, cadastrarUsuario
} from '../../api'; 

export default function App() {
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [tarefas, setTarefas] = useState([]);

  // Estados para Login e Cadastro
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoLogin, setModoLogin] = useState(true);

  // Estados para Tarefas
  const [novaTarefa, setNovaTarefa] = useState('');
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    verificarAcesso();
  }, []);

  // 🛡️ Função que decide se mostra o Login ou as Tarefas
  async function verificarAcesso() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLogado(true);
        await carregarDados();
      }
    } catch (err) {
      console.log("Erro ao verificar token:", err);
    } finally {
      // O 'finally' é o segredo do Arquiteto: ele roda independente de erro ou sucesso
      setCarregando(false); 
    }
  }

  async function carregarDados() {
    try {
      const dados = await buscarTarefas();
      setTarefas(dados);
    } catch (err) {
      // Se der erro de autorização (401), desloga o usuário
      await AsyncStorage.removeItem('token');
      setLogado(false);
    }
  }

  // --- LÓGICA DE USUÁRIO ---

  async function handleAuth() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      setCarregando(true);
      if (modoLogin) {
        const res = await fazerLogin(email, senha);
        if (res.ok) {
          const d = await res.json();
          await AsyncStorage.setItem('token', d.token);
          setLogado(true);
          await carregarDados();
        } else {
          Alert.alert("Erro", "E-mail ou senha incorretos.");
        }
      } else {
        const res = await cadastrarUsuario(email, senha);
        if (res.ok) {
          Alert.alert("Sucesso!", "Usuário criado. Agora faça login.");
          setModoLogin(true);
        } else {
          Alert.alert("Erro", "E-mail já cadastrado.");
        }
      }
    } catch (err) {
      Alert.alert("Erro de Rede", "O servidor no Render pode estar acordando. Tente novamente em 30 segundos.");
    } finally {
      setCarregando(false);
    }
  }

  // --- LÓGICA DE TAREFAS (CRUD) ---

  async function handleAdd() {
    if (!novaTarefa.trim()) return;
    try {
      await salvarTarefa(novaTarefa);
      setNovaTarefa('');
      Keyboard.dismiss();
      await carregarDados();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar a tarefa.");
    }
  }

  async function handleToggle(item) {
    try {
      await atualizarTarefa(item.id, item.texto, item.concluida ? 0 : 1);
      await carregarDados();
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDelete(id) {
    Alert.alert("Excluir", "Deseja apagar essa tarefa?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Apagar", onPress: async () => { 
          await excluirTarefa(id); 
          carregarDados(); 
        }, 
        style: "destructive" 
      }
    ]);
  }

  function abrirEdicao(item) {
    setTarefaParaEditar(item);
    setTextoEdicao(item.texto);
    setModalEditarVisivel(true);
  }

  async function salvarEdicao() {
    if (!textoEdicao.trim()) return;
    try {
      await atualizarTarefa(tarefaParaEditar.id, textoEdicao, tarefaParaEditar.concluida);
      setModalEditarVisivel(false);
      await carregarDados();
    } catch (err) {
      Alert.alert("Erro", "Falha ao editar.");
    }
  }

  // --- RENDERS (Telas) ---

  if (carregando && !logado) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ marginTop: 10, color: '#6366f1' }}>Conectando ao Render...</Text>
      </View>
    );
  }

  if (!logado) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.tituloApp}>To-Do Cloud 🚀</Text>
        <View style={styles.cardLogin}>
          <Text style={styles.label}>{modoLogin ? 'Login' : 'Criar Conta'}</Text>
          <TextInput 
            style={styles.input} 
            placeholder="E-mail" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Senha" 
            value={senha} 
            onChangeText={setSenha} 
            secureTextEntry 
          />
          
          <TouchableOpacity style={styles.botaoPrincipal} onPress={handleAuth}>
            <Text style={styles.botaoTexto}>{modoLogin ? 'ENTRAR' : 'CADASTRAR'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setModoLogin(!modoLogin)}>
            <Text style={{ textAlign: 'center', color: '#6366f1' }}>
              {modoLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloApp}>Minhas Tarefas</Text>
        <TouchableOpacity onPress={async () => { await AsyncStorage.removeItem('token'); setLogado(false); }}>
          <Text style={{ color: '#ef4444' }}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Nova tarefa..."
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
              <TouchableOpacity onPress={() => abrirEdicao(item)}>
                <Text style={styles.emoji}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.emoji}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* MODAL DE EDIÇÃO */}
      <Modal visible={modalEditarVisivel} animationType="fade" transparent={true}>
        <View style={styles.modalFundo}>
          <View style={styles.modalConteudo}>
            <Text style={styles.modalTitulo}>Editar Tarefa</Text>
            <TextInput
              style={styles.input}
              value={textoEdicao}
              onChangeText={setTextoEdicao}
              autoFocus={true}
            />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  tituloApp: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#475569' },
  cardLogin: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15, borderWide: 1, borderColor: '#e2e8f0' },
  inputArea: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  botaoAdd: { backgroundColor: '#6366f1', width: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  botaoPrincipal: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemTarefa: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  textoTarefa: { fontSize: 16, color: '#1e293b' },
  textoRiscado: { textDecorationLine: 'line-through', color: '#94a3b8' },
  emoji: { fontSize: 20 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalConteudo: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 20 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalBotoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  btnCancelar: { padding: 10 },
  btnSalvar: { backgroundColor: '#6366f1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 }
});