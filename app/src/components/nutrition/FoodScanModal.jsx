import React, { useState } from 'react';
import { logMeal, analyzeFood, analyzeFoodPhoto } from '../../services/nutritionApi';
import { useAuthStore } from '../../store/authStore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const FoodScanModal = ({ isOpen, onClose, onMealLogged }) => {
    const { user } = useAuthStore();
    const [mode, setMode] = useState('camera'); // 'camera' or 'text'
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getMealNameByTime = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Café da Manhã';
        if (hour < 15) return 'Almoço';
        if (hour < 18) return 'Lanche';
        return 'Jantar';
    };

    const [selectedMealType, setSelectedMealType] = useState(getMealNameByTime());

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setAnalysis(null);
            setError(null);
        }
    };

    const handleCamera = async () => {
        try {
            const photo = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera
            });

            // Read the file into a blob to be consistent with file input
            const response = await fetch(photo.webPath);
            const blob = await response.blob();
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

            setImage(file);
            setPreview(photo.webPath);
            setAnalysis(null);
            setError(null);
        } catch (e) {
            console.log('User cancelled camera or error:', e);
            // Don't set error here as user might just have clicked cancel
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);

        try {
            let result = null;

            if (mode === 'camera') {
                if (!image) return;
                const base64data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => { try { resolve(reader.result.split(',')[1]); } catch (e) { reject(e); } };
                    reader.onerror = reject;
                    reader.readAsDataURL(image);
                });
                const { data, error } = await analyzeFoodPhoto(base64data, image.type || 'image/jpeg');
                if (error) throw new Error(typeof error === 'string' ? error : 'Erro na análise da imagem');
                result = data;
            } else {
                if (!textInput.trim()) return;
                const { data, error } = await analyzeFood(textInput);
                if (error) throw new Error(typeof error === 'string' ? error : 'Erro na análise do texto');
                result = data;
            }

            if (result?.items?.length > 0) {
                setAnalysis(result);
            } else {
                setError('Não foi possível identificar os alimentos. Verifique a descrição e tente novamente.');
            }
        } catch (err) {
            console.error('Analyze error:', err);
            setError(err.message || 'Erro ao processar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!analysis || !user) return;

        setLoading(true);
        try {
            const mealName = selectedMealType;
            const { error } = await logMeal(
                user.id,
                mealName,
                analysis.items,
                new Date()
            );

            if (error) throw error;

            onMealLogged();
            onClose();
            // Reset states
            setMode('camera');
            setImage(null);
            setPreview(null);
            setTextInput('');
            setAnalysis(null);
        } catch (err) {
            console.error(err);
            setError('Erro ao salvar refeição.');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-text-main dark:text-white">
            <div className="bg-white dark:bg-[#1c2e22] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
                    <h3 className="font-bold text-lg dark:text-white">Registrar Refeição</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="material-symbols-outlined dark:text-gray-400">close</span>
                    </button>
                </div>

                <div className="flex border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <button
                        onClick={() => { setMode('camera'); setAnalysis(null); setError(null); }}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'camera' ? 'text-[#13ec5b] border-b-2 border-[#13ec5b]' : 'text-gray-400'}`}
                    >
                        <span className="material-symbols-outlined align-middle mr-1 text-lg">photo_camera</span>
                        Foto
                    </button>
                    <button
                        onClick={() => { setMode('text'); setAnalysis(null); setError(null); }}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'text' ? 'text-[#13ec5b] border-b-2 border-[#13ec5b]' : 'text-gray-400'}`}
                    >
                        <span className="material-symbols-outlined align-middle mr-1 text-lg">edit_note</span>
                        Manual
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* CAMERA MODE */}
                    {mode === 'camera' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Refeição
                                </label>
                                <select
                                    value={selectedMealType}
                                    onChange={(e) => setSelectedMealType(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]"
                                >
                                    <option value="Café da Manhã">Café da Manhã</option>
                                    <option value="Almoço">Almoço</option>
                                    <option value="Lanche">Lanche</option>
                                    <option value="Jantar">Jantar</option>
                                </select>
                            </div>

                            {!preview ? (
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleCamera}
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/50 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-4xl text-primary mb-2">photo_camera</span>
                                        <span className="text-sm font-bold text-primary">Tirar Foto</span>
                                    </button>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">ou</span>
                                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                    </div>

                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <span className="material-symbols-outlined text-2xl text-gray-400 mb-1">image</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Escolher da Galeria</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black">
                                        <img src={preview} alt="Prato" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
                                        >
                                            <span className="material-symbols-outlined text-sm">refresh</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* TEXT MODE */}
                    {mode === 'text' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Refeição
                                </label>
                                <select
                                    value={selectedMealType}
                                    onChange={(e) => setSelectedMealType(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[#13ec5b]"
                                >
                                    <option value="Café da Manhã">Café da Manhã</option>
                                    <option value="Almoço">Almoço</option>
                                    <option value="Lanche">Lanche</option>
                                    <option value="Jantar">Jantar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    O que você comeu?
                                </label>
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Ex: 1 banana média, 100g de frango grelhado e 1 colher de arroz..."
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[#13ec5b] min-h-[120px] resize-none"
                                />
                                <p className="text-xs text-gray-500">
                                    Descreva os alimentos e quantidades. O app calculará as calorias e macros automaticamente.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ANALYZE BUTTON (Shown if no analysis yet) */}
                    {!analysis && (
                        <div className="mt-6">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || (mode === 'camera' && !preview) || (mode === 'text' && !textInput.trim())}
                                className="w-full py-3 bg-[#13ec5b] text-[#0d1b12] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#13ec5b]/20 transition-all active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                        Analisando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">analytics</span>
                                        Calcular Macros
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* RESULTS & CONFIRMATION */}
                    {analysis && (
                        <div className="mt-4 space-y-4 animate-in slide-in-from-bottom-4">
                            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl">
                                <h4 className="font-bold text-sm mb-2 dark:text-gray-200 flex justify-between">
                                    <span>Alimentos Identificados</span>
                                    <span className="text-primary">{selectedMealType}</span>
                                </h4>
                                <ul className="space-y-2 mb-4">
                                    {analysis.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-1 last:border-0">
                                            <span className="dark:text-gray-300">{item.name} <span className="text-xs text-gray-500">({item.portion})</span></span>
                                            <span className="font-medium dark:text-white">{item.calories} kcal</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Kcal</div>
                                        <div className="font-bold text-lg text-primary">{analysis.total.calories}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Prot</div>
                                        <div className="font-bold text-sm dark:text-gray-300">{analysis.total.protein}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Carb</div>
                                        <div className="font-bold text-sm dark:text-gray-300">{analysis.total.carbs}g</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase">Gord</div>
                                        <div className="font-bold text-sm dark:text-gray-300">{analysis.total.fats}g</div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 italic">"{analysis.analysis_comment}"</p>

                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-3 bg-[#13ec5b] text-[#0d1b12] font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#13ec5b]/20 hover:scale-[1.02] transition-transform"
                            >
                                <span className="material-symbols-outlined">check</span>
                                Confirmar e Salvar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FoodScanModal;
