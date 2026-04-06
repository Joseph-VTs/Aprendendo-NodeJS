import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, Keyboard, Modal 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  buscarTarefas, salvarTarefa, excluirTarefa, 
  atualizarTarefa, fazerLogin, cadastrarUsuario 
} from '../../api';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [tarefas, setTarefas] = useState([]);
  
  // Estados para Login e Nova Tarefa
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novaTarefa, setNovaTarefa] = useState('');
  const [modoLogin, setModoLogin] = useState(true);

  // Estados para Edição (O "Pulo do Gato")
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    verificarAcesso();
  }, []);

  async function verificarAcesso() {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      setLogado(true);
      await carregarDados();
    }
    setCarregando(false);
  }

  // --- FUNÇÕES DE DADOS ---

  async function carregarDados() {
    try {
      const dados = await buscarTarefas();
      setTarefas(dados);
    } catch (err) {
      await AsyncStorage.removeItem('token');
      setLogado(false);
    }
  }

  async function handleAdd() {
    if (!novaTarefa.trim()) return;
    await salvarTarefa(novaTarefa);
    setNovaTarefa('');
    Keyboard.dismiss();
    await carregarDados();
  }

  // Abre a janelinha de edição preenchendo o texto atual
  function abrirEdicao(item) {
    setTarefaParaEditar(item);
    setTextoEdicao(item.texto);
    setModalEditarVisivel(true);
  }

  async function salvarEdicao() {
    if (!textoEdicao.trim()) return;
    try {
      // Enviamos o ID, o NOVO texto e o status de conclusão atual
      await atualizarTarefa(tarefaParaEditar.id, textoEdicao, tarefaParaEditar.concluida);
      setModalEditarVisivel(false);
      await carregarDados();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível editar a tarefa.");
    }
  }

  async function handleToggle(item) {
    await atualizarTarefa(item.id, item.texto, item.concluida ? 0 : 1);
    await carregarDados();
  }

  async function handleDelete(id) {
    Alert.alert("Excluir", "Deseja apagar?", [
      { text: "Não" },
      { text: "Sim", onPress: async () => { await excluirTarefa(id); carregarDados(); }}
    ]);
  }

  // --- TELAS ---

  if (carregando && !logado) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>;
  }

  if (!logado) {
    // ... (Mantivemos a tela de login igual para focar na edição)
    return (
        <View style={styles.container}>
          <Text style={styles.tituloApp}>To-Do Mobile 🚀</Text>
          <View style={styles.cardLogin}>
            <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none"/>
            <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
            <TouchableOpacity style={styles.botaoPrincipal} onPress={async () => {
                const res = await fazerLogin(email, senha);
                const d = await res.json();
                if(res.ok) { await AsyncStorage.setItem('token', d.token); setLogado(true); carregarDados(); }
            }}>
              <Text style={styles.botaoTexto}>ENTRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.tituloApp}>Minhas Tarefas</Text>

      <View style={styles.inputArea}>
        <TextInput 
          style={[styles.input, { flex: 1, marginBottom: 0 }]} 
          placeholder="O que fazer?" 
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
      <Modal visible={modalEditarVisivel} animationType="slide" transparent={true}>
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
                    <Text style={{color: '#64748b'}}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSalvar} onPress={salvarEdicao}>
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Salvar Alteração</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 25, paddingTop: 70 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tituloApp: { fontSize: 28, fontWeight: 'bold', color: '#6366f1', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  inputArea: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  botaoAdd: { backgroundColor: '#6366f1', width: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  botaoPrincipal: { backgroundColor: '#6366f1', padding: 16, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { color: '#fff', fontWeight: 'bold' },
  itemTarefa: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 },
  textoTarefa: { fontSize: 16, color: '#1e293b' },
  textoRiscado: { textDecorationLine: 'line-through', color: '#94a3b8' },
  emoji: { fontSize: 20 },
  cardLogin: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  
  // Estilos do Modal
  modalFundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalConteudo: { backgroundColor: '#fff', width: '85%', padding: 25, borderRadius: 15 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
  modalBotoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnCancelar: { padding: 12 },
  btnSalvar: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8 }
});