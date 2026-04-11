// Banco de dados completo de exercícios com GIFs animados
// Organizado por grupo muscular com imagens reais

// Grupos musculares com metadados
export const muscleGroups = [
    { id: 'peitoral', name: 'Peitoral', icon: 'keyboard_double_arrow_left', color: 'from-red-500 to-orange-500' },
    { id: 'costas', name: 'Costas', icon: 'keyboard_double_arrow_right', color: 'from-blue-500 to-cyan-500' },
    { id: 'ombros', name: 'Ombros', icon: 'expand_less', color: 'from-purple-500 to-pink-500' },
    { id: 'biceps', name: 'Bíceps', icon: 'fitness_center', color: 'from-orange-500 to-yellow-500' },
    { id: 'triceps', name: 'Tríceps', icon: 'fitness_center', color: 'from-green-500 to-emerald-500' },
    { id: 'pernas', name: 'Pernas', icon: 'directions_walk', color: 'from-indigo-500 to-purple-500' },
    { id: 'gluteos', name: 'Glúteos', icon: 'accessibility_new', color: 'from-pink-500 to-rose-500' },
    { id: 'abdomen', name: 'Abdômen', icon: 'local_fire_department', color: 'from-amber-500 to-red-500' },
    { id: 'cardio', name: 'Cardio', icon: 'favorite', color: 'from-rose-500 to-red-500' },
    { id: 'trapezio', name: 'Trapézio', icon: 'swap_vert', color: 'from-teal-500 to-cyan-500' },
    { id: 'antebraco', name: 'Antebraço', icon: 'pan_tool', color: 'from-slate-500 to-gray-500' },
    { id: 'alongamentos', name: 'Alongamentos', icon: 'self_improvement', color: 'from-cyan-500 to-teal-500' },
    { id: 'eretores', name: 'Eretores da Espinha', icon: 'straighten', color: 'from-amber-500 to-orange-500' },
    { id: 'membros_inf', name: 'Membros Inferiores', icon: 'directions_walk', color: 'from-violet-500 to-purple-500' },
    { id: 'panturrilhas', name: 'Panturrilhas', icon: 'airline_seat_legroom_normal', color: 'from-rose-500 to-pink-500' },
];

// Banco de dados de exercícios
export const exerciseDatabase = {
    peitoral: [
        { id: 'supino_reto_barra', name: 'Supino Reto com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273343462_supindo-reto-barra.gif', description: 'Deite no banco reto, segure a barra na largura dos ombros e empurre para cima.' },
        { id: 'supino_inclinado_barra', name: 'Supino Inclinado com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273399840_Supino-inclinado-com-barra.gif', description: 'No banco inclinado, empurre a barra focando na parte superior do peitoral.' },
        { id: 'supino_declinado_barra', name: 'Supino Declinado com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps'], gif: 'exercises/1768273381081_supino-declinado-barra.gif', description: 'No banco declinado, trabalhe a parte inferior do peitoral.' },
        { id: 'supino_halteres', name: 'Supino com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273360693_Supino-com-halteres-com-pegada-fechada.gif', description: 'Maior amplitude de movimento que a barra, ótimo para ativar mais fibras.' },
        { id: 'supino_inclinado_halteres', name: 'Supino Inclinado com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273403983_Supino-inclinado-com-halteres-e-pegada-fechada.gif', description: 'Foco na parte superior do peitoral com halteres.' },
        { id: 'supino_maquina', name: 'Supino na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps'], gif: 'exercises/1768273421082_Supino-na-Máquina-para-Miolo-do-Peitoral.gif', description: 'Excelente para iniciantes, movimento guiado e seguro.' },
        { id: 'supino_smith', name: 'Supino no Smith', equipment: 'smith', difficulty: 'iniciante', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273423085_Supino-na-máquina-Smith.gif', description: 'Movimento guiado pela barra smith, ideal para treinar sozinho.' },
        { id: 'crucifixo_halteres', name: 'Crucifixo com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273301871_Crucifixo-com-Halteres-Declinado.gif', description: 'Isola o peitoral com movimento de abertura dos braços.' },
        { id: 'crucifixo_inclinado', name: 'Crucifixo Inclinado', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273303423_Crucifixo-com-Halteres-Inclinado.gif', description: 'Crucifixo no banco inclinado para peitoral superior.' },
        { id: 'cross_polia_alta', name: 'Cross Over Polia Alta', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273286286_Cross-over-polia-Alta.gif', description: 'De pé no cross over, cruze os cabos para baixo contraindo o peitoral.' },
        { id: 'cross_polia_baixa', name: 'Cross Over Polia Baixa', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273288779_Cross-over-polia-baixa.gif', description: 'Polia baixa para trabalhar parte superior do peitoral.' },
        { id: 'voador_maquina', name: 'Voador na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273448833_Voador-na-Máquina.gif', description: 'Máquina pec deck, movimento controlado para isolar peitoral.' },
        { id: 'crucifixo_maquina', name: 'Crucifixo Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'peitoral', secondaryMuscles: ['ombros'], gif: 'exercises/1768273313041_Crucifixo-Maquina.gif', description: 'Voador na máquina para isolamento do peitoral.' },
        { id: 'paralelas', name: 'Paralelas (Peito)', equipment: 'corpo', difficulty: 'avancado', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273335731_Paralelas.gif', description: 'Incline o tronco para frente para focar mais no peitoral.' },
        { id: 'pullover_halter', name: 'Pullover com Haltere', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'peitoral', secondaryMuscles: ['costas', 'tríceps'], gif: 'exercises/1768273339330_Pullover-com-haltere.gif', description: 'Deitado atravessado no banco, leve o halter atrás da cabeça e volte.' },
        { id: 'flexao_frente', name: 'Flexão de Frente', equipment: 'corpo', difficulty: 'iniciante', primaryMuscle: 'peitoral', secondaryMuscles: ['tríceps', 'ombros'], gif: 'exercises/1768273284843_Apoio-de-frente-de-joelhos.gif', description: 'Exercício clássico de peso corporal.' },
    ],

    costas: [
        { id: 'puxada_frente', name: 'Puxada Frontal', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272794811_Puxada-Alta-com-Alavanca.gif', description: 'Puxe a barra até o peito mantendo as costas contraídas.' },
        { id: 'puxada_triangulo', name: 'Puxada com Triângulo', equipment: 'maquina', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272796062_Puxada-Alta-com-Triângulo.gif', description: 'Puxada com pegada neutra, foco no meio das costas.' },
        { id: 'puxada_nuca', name: 'Puxada Alta Nuca', equipment: 'maquina', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272804924_Puxada-alta-na-polia-nuca.gif', description: 'Puxada por trás da cabeça - cuidado com a execução.' },
        { id: 'remada_baixa', name: 'Remada Sentada com Cabo', equipment: 'cabo', difficulty: 'iniciante', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272886260_Remada-Sentada-com-Cabo.gif', description: 'Sentado, puxe o cabo até o abdômen contraindo as escápulas.' },
        { id: 'remada_curvada', name: 'Remada Curvada com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps', 'lombar'], gif: 'exercises/1768272847536_Remada-curvada-com-barra-de-pegada-alternada-ampla-com-adução-de-escapula.gif', description: 'Incline o tronco e puxe a barra até o abdômen.' },
        { id: 'remada_unilateral', name: 'Remada Serrote', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272893531_remada-serrote.gif', description: 'Apoie um joelho no banco e puxe o halter com uma mão.' },
        { id: 'remada_maquina', name: 'Remada na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272890092_Remada-Sentada-na-Máquina.gif', description: 'Remada guiada na máquina, excelente para iniciantes.' },
        { id: 'remada_cavalinho', name: 'Remada Cavalinho', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272894847_Remada-T-com-alavanca.gif', description: 'Remada T, apoio no peito, puxe com as costas.' },
        { id: 'pulldown_corda', name: 'Pulldown com Corda', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272770950_Pulldown-com-corda.gif', description: 'Puxada alta com corda para maior contração.' },
        { id: 'barra_fixa', name: 'Barra Fixa', equipment: 'corpo', difficulty: 'avancado', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272451160_Puxada-escapular-na-barra-fixa.gif', description: 'Exercício clássico para largura das costas.' },
        { id: 'barra_fixa_assistida', name: 'Barra Fixa Assistida', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272740981_Barra-Fixa-Assistida.gif', description: 'Gravitron para ajudar na execução da barra fixa.' },
        { id: 'levantamento_terra', name: 'Levantamento Terra', equipment: 'barra', difficulty: 'avancado', primaryMuscle: 'costas', secondaryMuscles: ['glúteos', 'pernas'], gif: 'exercises/1768272761874_levantamento-terra-no-smith.gif', description: 'Exercício composto para toda a cadeia posterior.' },
        { id: 'pullover_polia', name: 'Pullover na Polia', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['tríceps'], gif: 'exercises/1768272788043_Pullover-com-cabo-sentado.gif', description: 'Pullover no cross over para costas.' },
        { id: 'remada_inclinada', name: 'Remada Inclinada com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'costas', secondaryMuscles: ['bíceps'], gif: 'exercises/1768272839399_remada-com-banco-inclinado-com-haltres.gif', description: 'Deitado de bruços no banco inclinado, puxe os halteres.' },
    ],

    ombros: [
        { id: 'desenvolvimento_halteres', name: 'Desenvolvimento com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'ombros', secondaryMuscles: ['tríceps'], gif: 'exercises/1768273076771_Desenvolvimento-com-Halteres.gif', description: 'Sentado ou em pé, empurre os halteres para cima.' },
        { id: 'desenvolvimento_maquina', name: 'Desenvolvimento na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: ['tríceps'], gif: 'Ombros/Desenvolvimento de ombro na máquina.gif', description: 'Movimento guiado para desenvolvimento de ombros.' },
        { id: 'desenvolvimento_arnold', name: 'Desenvolvimento Arnold', equipment: 'halteres', difficulty: 'avancado', primaryMuscle: 'ombros', secondaryMuscles: ['tríceps'], gif: 'exercises/1768273065140_Desenvolvimento-arnold-com-um-braco.gif', description: 'Rotação durante o movimento, criado por Arnold.' },
        { id: 'desenvolvimento_barra', name: 'Desenvolvimento com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'ombros', secondaryMuscles: ['tríceps'], gif: 'exercises/1768273074762_Desenvolvimento-com-Barra-sentado.gif', description: 'Desenvolvimento militar com barra à frente.' },
        { id: 'elevacao_lateral', name: 'Elevação Lateral', equipment: 'halteres', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: [], gif: 'Ombros/elevação letaral com haltrers.gif', description: 'Eleve os halteres lateralmente até a altura dos ombros.' },
        { id: 'elevacao_lateral_maquina', name: 'Elevação Lateral Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: [], gif: 'Ombros/Elevação lateral na máquina.gif', description: 'Elevação lateral na máquina para deltoides.' },
        { id: 'elevacao_frontal', name: 'Elevação Frontal', equipment: 'halteres', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: [], gif: 'Ombros/elevação frontal com halteres.gif', description: 'Eleve o halter à frente até altura do ombro.' },
        { id: 'elevacao_frontal_barra', name: 'Elevação Frontal com Barra', equipment: 'barra', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: [], gif: 'Ombros/Elevação Frontal com Barra.gif', description: 'Eleve a barra à frente trabalhando deltoides anterior.' },
        { id: 'remada_alta', name: 'Remada Alta', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'ombros', secondaryMuscles: ['trapézio'], gif: 'exercises/1768272700951_1.gif', description: 'Puxe a barra até o queixo, cotovelos para fora.' },
        { id: 'crucifixo_inverso', name: 'Crucifixo Inverso', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'ombros', secondaryMuscles: ['costas'], gif: 'exercises/1768273055626_Crucifixo-Invertido-com-Halteres.gif', description: 'Inclinado para frente, abra os braços para posterior.' },
        { id: 'voador_inverso', name: 'Voador Invertido', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'ombros', secondaryMuscles: ['costas'], gif: 'exercises/1768272912810_voador-invertido.gif', description: 'Máquina para deltoides posterior.' },
        { id: 'elevacao_lateral_cabo', name: 'Elevação Lateral com Cabo', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'ombros', secondaryMuscles: [], gif: 'Ombros/elevação unilateral no cross.gif', description: 'Elevação lateral unilateral no cross over.' },
    ],

    biceps: [
        { id: 'rosca_direta', name: 'Rosca Direta com Barra', equipment: 'barra', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: ['antebraço'], gif: 'exercises/1768272636144_Rosca-Direta-com-Barra-deitado-em-Banco-Alto.gif', description: 'Exercício básico para bíceps, mantenha cotovelos fixos.' },
        { id: 'rosca_barra_w', name: 'Rosca com Barra W', equipment: 'barra', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: ['antebraço'], gif: 'exercises/1768272633674_rosca-direta-barra-W-sentado-banco.gif', description: 'Pegada confortável que reduz tensão nos punhos.' },
        { id: 'rosca_halteres', name: 'Rosca com Halteres', equipment: 'halteres', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: ['antebraço'], gif: 'exercises/1768272607058_Rosca-com-halteres-no-colete-scott.gif', description: 'Rosca alternada ou simultânea com halteres.' },
        { id: 'rosca_martelo', name: 'Rosca Martelo', equipment: 'halteres', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: ['antebraço'], gif: 'exercises/1768272657628_Rosca-martelo-com-corda.gif', description: 'Pegada neutra para braquial e braquiorradial.' },
        { id: 'rosca_concentrada', name: 'Rosca Concentrada', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272611191_Rosca-Concentrada-2.gif', description: 'Cotovelo apoiado na coxa, máximo isolamento.' },
        { id: 'rosca_scott', name: 'Rosca Scott', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272675771_rosca-no-scort.gif', description: 'No banco Scott para isolar o bíceps.' },
        { id: 'rosca_scott_haltere', name: 'Rosca Scott com Haltere', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272684305_Rosca-Scott-com-Halteres-Martelo-no-Banco.gif', description: 'Rosca unilateral no banco Scott.' },
        { id: 'rosca_banco_inclinado', name: 'Rosca Banco Inclinado', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272579600_Rosca-Banco-Inclinado.gif', description: 'Deitado no banco inclinado para alongar o bíceps.' },
        { id: 'rosca_polia', name: 'Rosca no Cabo', equipment: 'cabo', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272673310_Rosca-no-Cabo-Deitado.png', description: 'Rosca na polia baixa, tensão constante.' },
        { id: 'rosca_polia_alta', name: 'Rosca Polia Alta', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272563322_biceps-polia-alta-dupla.gif', description: 'Posição crucifixo, puxe os cabos até a cabeça.' },
        { id: 'rosca_maquina', name: 'Rosca na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'bíceps', secondaryMuscles: [], gif: 'exercises/1768272567833_Máquina-de-rosca-direta.gif', description: 'Movimento guiado na máquina de bíceps.' },
    ],

    triceps: [
        { id: 'triceps_corda', name: 'Tríceps Pulley Corda', equipment: 'cabo', difficulty: 'iniciante', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273832007_Tríceps-pulley-corda.gif', description: 'Puxe a corda para baixo e separe no final.' },
        { id: 'triceps_barra', name: 'Tríceps Pulley Barra', equipment: 'cabo', difficulty: 'iniciante', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273827821_Tríceps-Pulley-barra-V.gif', description: 'Extensão de tríceps com barra reta no pulley.' },
        { id: 'triceps_barra_v', name: 'Tríceps Pulley Barra V', equipment: 'cabo', difficulty: 'iniciante', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273827821_Tríceps-Pulley-barra-V.gif', description: 'Pegada mais confortável com barra V.' },
        { id: 'triceps_frances', name: 'Tríceps Francês com Halter', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'Tríceps/Tríceps Francês com Halteres.gif', description: 'Halter atrás da cabeça, extensão dos braços.' },
        { id: 'triceps_frances_barra', name: 'Tríceps Francês com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273777725_Triceps-frances-barra-W.gif', description: 'Extensão sobre a cabeça com barra W.' },
        { id: 'triceps_testa', name: 'Tríceps Testa com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273836416_Tríceps-Testa-com-Barra-Pegada-Invertida.gif', description: 'Deitado, leve a barra até a testa e estenda.' },
        { id: 'triceps_testa_haltere', name: 'Tríceps Testa com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273796344_Triceps-testa-com-halteres.gif', description: 'Versão com halteres do tríceps testa.' },
        { id: 'triceps_coice', name: 'Tríceps Coice', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'exercises/1768273809073_Tríceps-Coice-com-Halteres.gif', description: 'Inclinado, estenda o braço para trás.' },
        { id: 'triceps_banco', name: 'Tríceps no Banco', equipment: 'corpo', difficulty: 'iniciante', primaryMuscle: 'tríceps', secondaryMuscles: ['ombros'], gif: 'exercises/1768273823473_Tríceps-no-Banco.gif', description: 'Apoio reverso no banco, desça e suba.' },
        { id: 'supino_fechado', name: 'Supino Pegada Fechada', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'tríceps', secondaryMuscles: ['peitoral'], gif: 'exercises/1768273444074_Supino.gif', description: 'Supino com pegada fechada para tríceps.' },
        { id: 'mergulho_triceps', name: 'Mergulho de Tríceps', equipment: 'corpo', difficulty: 'avancado', primaryMuscle: 'tríceps', secondaryMuscles: ['peitoral'], gif: 'exercises/1768273755948_Mergulho-de-tríceps-com-alavanca.gif', description: 'Paralelas com corpo ereto para tríceps.' },
        { id: 'triceps_maquina', name: 'Tríceps na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'tríceps', secondaryMuscles: [], gif: 'Tríceps/Extensão de tríceps na máquina.gif', description: 'Extensão guiada na máquina.' },
    ],

    pernas: [
        { id: 'agachamento_livre', name: 'Agachamento Livre', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos', 'lombar'], gif: 'exercises/1768272932666_Agachamento-na-Maquina-Abdutora.gif', description: 'Rei dos exercícios. Joelhos alinhados com os pés.' },
        { id: 'agachamento_smith', name: 'Agachamento no Smith', equipment: 'smith', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273509148_Agachamento-no-Smith.gif', description: 'Versão guiada do agachamento para iniciantes.' },
        { id: 'agachamento_hack', name: 'Agachamento Hack', equipment: 'maquina', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273503775_Agachamento-na-Máquina-Hack.gif', description: 'Máquina que isola o quadríceps.' },
        { id: 'agachamento_frontal', name: 'Agachamento Frontal', equipment: 'barra', difficulty: 'avancado', primaryMuscle: 'pernas', secondaryMuscles: ['core'], gif: 'exercises/1768273484428_Agachamento-Frontal-com-Barra-no-Banco.gif', description: 'Barra à frente, foco no quadríceps.' },
        { id: 'agachamento_bulgaro', name: 'Agachamento Búlgaro', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273468610_Agachamento-Búlgaro-com-Halteres.gif', description: 'Pé traseiro elevado no banco.' },
        { id: 'agachamento_sumo', name: 'Agachamento Sumô', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos', 'adutores'], gif: 'exercises/1768273527713_Agachamento.gif', description: 'Pernas afastadas, pontas dos pés para fora.' },
        { id: 'leg_press', name: 'Leg Press', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273008898_LEG-PRESS-HORIZONTAL.gif', description: 'Empurre a plataforma sem travar os joelhos.' },
        { id: 'leg_press_45', name: 'Leg Press 45°', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273008898_LEG-PRESS-HORIZONTAL.gif', description: 'Versão inclinada do leg press.' },
        { id: 'cadeira_extensora', name: 'Cadeira Extensora', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: [], gif: 'exercises/1768272995042_cadeira-extensora.gif', description: 'Isola o quadríceps, extensão de joelhos.' },
        { id: 'mesa_flexora', name: 'Mesa Flexora', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: [], gif: 'exercises/1768273018500_mesa-flex.gif', description: 'Isola posterior da coxa.' },
        { id: 'cadeira_flexora', name: 'Cadeira Flexora', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: [], gif: 'exercises/1768272995810_cadeira-flex.gif', description: 'Flexão de joelhos sentado.' },
        { id: 'stiff', name: 'Stiff', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos', 'lombar'], gif: 'exercises/1768273036998_stiff-com-barra.gif', description: 'Levantamento terra com pernas semi-estendidas.' },
        { id: 'levantamento_terra_pernas', name: 'Levantamento Terra', equipment: 'barra', difficulty: 'avancado', primaryMuscle: 'pernas', secondaryMuscles: ['costas', 'glúteos'], gif: 'exercises/1768272761874_levantamento-terra-no-smith.gif', description: 'Exercício composto completo.' },
        { id: 'afundo', name: 'Afundo com Halteres', equipment: 'halteres', difficulty: 'intermediario', primaryMuscle: 'pernas', secondaryMuscles: ['glúteos'], gif: 'exercises/1768273459859_Afundo-com-Halteres.gif', description: 'Avance um passo e desça até 90 graus.' },
        { id: 'adutora', name: 'Máquina Adutora', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'pernas', secondaryMuscles: [], gif: 'Pernas/Máquina de Adução de Quadril.gif', description: 'Trabalha a parte interna das coxas.' },
    ],

    gluteos: [
        { id: 'elevacao_pelvica', name: 'Elevação Pélvica com Barra', equipment: 'barra', difficulty: 'intermediario', primaryMuscle: 'glúteos', secondaryMuscles: ['pernas'], gif: 'Glúteos/Elevação Pélvica Com Barra.gif', description: 'Hip thrust, melhor exercício para glúteos.' },
        { id: 'elevacao_pelvica_maquina', name: 'Elevação Pélvica na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'Glúteos/Elevação Pélvica Na Máquina.gif', description: 'Hip thrust guiado na máquina.' },
        { id: 'gluteo_maquina', name: 'Glúteo na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'Glúteos/Glúteo Coice Na Máquina.gif', description: 'Coice de glúteo na máquina.' },
        { id: 'gluteo_polia', name: 'Glúteo na Polia', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'Glúteos/Glúteos na Polia Baixa.gif', description: 'Extensão de quadril no cross over.' },
        { id: 'abdutora', name: 'Máquina Abdutora', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'Glúteos/Máquina de Abdução de Quadril.gif', description: 'Abre as pernas trabalhando glúteo médio.' },
        { id: 'quatro_apoios', name: 'Quatro Apoios', equipment: 'corpo', difficulty: 'iniciante', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'exercises/1768272334322_Alongamento-de-Quadriceps-em-Quatro-Apoios.gif', description: 'Exercício de solo para glúteos.' },
        { id: 'ponte_haltere', name: 'Ponte com Haltere', equipment: 'halteres', difficulty: 'iniciante', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'exercises/1768272964049_Ponte-com-Halteres.gif', description: 'Elevação pélvica no solo com peso.' },
        { id: 'extensao_quadril_cabo', name: 'Extensão de Quadril com Cabo', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'glúteos', secondaryMuscles: [], gif: 'Glúteos/Extensão de Quadril com Cabo.gif', description: 'Extensão de quadril unilateral.' },
    ],

    abdomen: [
        { id: 'abdominal_supra', name: 'Abdominal Supra', equipment: 'corpo', difficulty: 'iniciante', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'exercises/1768272256069_Abdominal-Supra-com-Alcance-(entre-as-pernas).-Variacao-onde-se-eleva-o-tronco-passando-os-bracos-esticados-no-meio-dos-joelhos..gif', description: 'Eleve os ombros do chão contraindo o abdômen.' },
        { id: 'abdominal_maquina', name: 'Abdominal na Máquina', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'exercises/1768272251926_ABDOMINAL-MAQUINA.gif', description: 'Abdominal guiado na máquina com carga.' },
        { id: 'abdominal_polia', name: 'Abdominal na Polia', equipment: 'cabo', difficulty: 'intermediario', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'Abdominal/Abdominal Crunch na Polia Alta (em pé). Executado no cross over puxando a corda para baixo, focando na contração do abdômen.gif', description: 'Ajoelhado, puxe a corda para baixo.' },
        { id: 'abdominal_infra', name: 'Abdominal Infra', equipment: 'corpo', difficulty: 'intermediario', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'Abdominal/Abdominal Infra no Solo-Elevação de Pernas.gif', description: 'Elevação de pernas focando parte inferior.' },
        { id: 'abdominal_paralela', name: 'Abdominal na Paralela', equipment: 'corpo', difficulty: 'avancado', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'exercises/1768272245558_Abdominal-Infra-na-Paralela.gif', description: 'Suspenso nas paralelas, eleve as pernas.' },
        { id: 'prancha', name: 'Prancha', equipment: 'corpo', difficulty: 'iniciante', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'exercises/1768272265712_PRANCHA.gif', description: 'Posição estática fortalecendo o core.' },
        { id: 'bicicleta', name: 'Abdominal Bicicleta', equipment: 'corpo', difficulty: 'intermediario', primaryMuscle: 'abdômen', secondaryMuscles: ['oblíquos'], gif: 'exercises/1768272236730_Abdominal-Bicicleta.gif', description: 'Alterne cotovelo-joelho em movimento de pedalar.' },
        { id: 'obliquo', name: 'Abdominal Oblíquo', equipment: 'corpo', difficulty: 'intermediario', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'Abdominal/Abdominal Oblíquo Cruzado (unilateral).gif', description: 'Rotação do tronco para trabalhar os oblíquos.' },
        { id: 'abdominal_declinado', name: 'Abdominal Declinado', equipment: 'corpo', difficulty: 'intermediario', primaryMuscle: 'abdômen', secondaryMuscles: [], gif: 'exercises/1768272242128_Abdominal-Declinado-(feito-no-banco-inclinado)..gif', description: 'No banco declinado para maior intensidade.' },
    ],

    cardio: [
        { id: 'esteira', name: 'Esteira Ergométrica', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'cardio', secondaryMuscles: ['pernas'], gif: 'Cardio/Esteira Ergométrica.gif', description: 'Caminhada ou corrida na esteira.' },
        { id: 'esteira_inclinada', name: 'Esteira Inclinada', equipment: 'maquina', difficulty: 'intermediario', primaryMuscle: 'cardio', secondaryMuscles: ['pernas', 'glúteos'], gif: 'Cardio/Esteira com Inclinação.gif', description: 'Caminhada em inclinação para maior intensidade.' },
        { id: 'bicicleta', name: 'Bicicleta Ergométrica', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'cardio', secondaryMuscles: ['pernas'], gif: 'exercises/1768272716156_Airbike.gif', description: 'Pedalada de baixo impacto.' },
        { id: 'eliptico', name: 'Elíptico', equipment: 'maquina', difficulty: 'iniciante', primaryMuscle: 'cardio', secondaryMuscles: ['pernas', 'braços'], gif: 'Cardio/Máquina Elíptica.gif', description: 'Movimento completo de baixo impacto.' },
        { id: 'simulador_escada', name: 'Simulador de Escada', equipment: 'maquina', difficulty: 'intermediario', primaryMuscle: 'cardio', secondaryMuscles: ['pernas', 'glúteos'], gif: 'Cardio/Máquina Simulador Escada.gif', description: 'Suba escadas sem parar.' },
        { id: 'airbike', name: 'Air Bike', equipment: 'maquina', difficulty: 'avancado', primaryMuscle: 'cardio', secondaryMuscles: ['corpo todo'], gif: 'exercises/1768272716156_Airbike.gif', description: 'Bicicleta de resistência ao ar.' },
    ],

    trapezio: [],
    antebraco: [],
    alongamentos: [],
    eretores: [],
    membros_inf: [],
    panturrilhas: [],
};

// URL Base opcional se algum dia precisarmos
const LOCAL_GIF_BASE = '/gifs/';

// Função para obter URL do GIF
export const getExerciseGifUrl = (gifPath) => {
    if (!gifPath) return null;

    // Usa a env var ou um fallback hardcodeado por segurança
    const publicDomain = import.meta.env.VITE_R2_PUBLIC_DOMAIN || 'https://pub-855d004e6f2d4b47804b1941f9b5cc75.r2.dev';

    const pathStr = String(gifPath);
    if (pathStr.toLowerCase().startsWith('http')) {
        return pathStr;
    }

    // Remove barra inicial se houver para evitar duplicidade na junção
    const cleanPath = gifPath.startsWith('/') ? gifPath.slice(1) : gifPath;

    // Codifica cada segmento do caminho para lidar com espaços e acentos corretamente
    // Ex: "Peitoral/supindo reto.gif" -> "Peitoral/supindo%20reto.gif"
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(decodeURIComponent(segment))).join('/');

    return `${publicDomain}/${encodedPath}`.replace(/([^:]\/)\/+/g, "$1");
};

// Função para obter total de exercícios
export const getTotalExercises = () => {
    return Object.values(exerciseDatabase).reduce((total, group) => total + group.length, 0);
};

// Exportar todos os exercícios em lista única
export const getAllExercises = () => {
    const all = [];
    Object.entries(exerciseDatabase).forEach(([groupId, exercises]) => {
        exercises.forEach(ex => {
            all.push({ ...ex, groupId });
        });
    });
    return all;
};
