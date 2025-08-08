import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface GameState {
  health: number;
  sanity: number;
  location: string;
  inventory: string[];
  currentStory: number;
  chapter: number;
  achievements: string[];
  soundEnabled: boolean;
  musicEnabled: boolean;
  completedPuzzles: string[];
  discoveredSecrets: string[];
}

interface DialogChoice {
  text: string;
  effect: () => void;
  requirement?: () => boolean;
}

interface RoomPuzzle {
  description: string;
  solved: boolean;
  solution: string;
  reward: string;
}

const HorrorGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    sanity: 85,
    location: 'Главная комната',
    inventory: ['Старый ключ', 'Свеча'],
    currentStory: 0,
    chapter: 1,
    achievements: [],
    soundEnabled: true,
    musicEnabled: true,
    completedPuzzles: [],
    discoveredSecrets: []
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState('menu');
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [currentDialog, setCurrentDialog] = useState<string | null>(null);
  const [dialogChoices, setDialogChoices] = useState<DialogChoice[]>([]);
  const [roomPuzzles, setRoomPuzzles] = useState<{ [key: string]: RoomPuzzle }>({});
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [soundVolume, setSoundVolume] = useState(75);
  const [musicVolume, setMusicVolume] = useState(50);
  
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Расширенная сюжетная линия
  const storySegments = [
    "Вы просыпаетесь в незнакомой комнате. Воздух тяжел, а тени танцуют в углах. Вдалеке слышится шепот...",
    "Скрип половиц под ногами эхом разносится по коридору. Что-то наблюдает за вами из темноты...",
    "Зеркало в конце коридора отражает не ваше лицо, а нечто ужасное. Реальность начинает искажаться...",
    "Голоса в стенах становятся громче. Они зовут вас по имени, которое вы не помните...",
    "Время теряет смысл. Минуты превращаются в часы, а часы - в вечность кошмара...",
    "Древние символы на стенах начинают светиться. Вы понимаете, что это место - не просто дом...",
    "Воспоминания возвращаются обрывками. Вы были здесь раньше... но когда?",
    "Последняя надежда тускнеет. Выход может быть только один - принять свою судьбу..."
  ];

  const roomDescriptions = {
    'Главная комната': 'Мрачная комната с потрескавшимися обоями. Единственный источник света - мерцающая свеча.',
    'Темный коридор': 'Длинный коридор, уходящий во тьму. Стены покрыты странными символами.',
    'Библиотека': 'Древние книги хранят запретные знания. Некоторые страницы светятся призрачным светом.',
    'Подвал': 'Сырой подвал с каменными стенами. Отсюда доносятся странные звуки.',
    'Чердак': 'Пыльный чердак, полный забытых вещей. Что-то шевелится в углах.',
    'Алхимическая лаборатория': 'Таинственная лаборатория с пузырящимися колбами и странными приборами.',
    'Склеп': 'Древний склеп с саркофагами. Воздух наполнен запахом тлена.',
    'Башня': 'Высокая башня с видом на проклятые земли. Ветер воет в окнах.'
  };

  const rooms = [
    'Главная комната',
    'Темный коридор', 
    'Библиотека',
    'Подвал',
    'Чердак',
    'Алхимическая лаборатория',
    'Склеп',
    'Башня'
  ];

  const achievements = {
    'first_death': 'Первая смерть - Встретить свой конец',
    'sanity_zero': 'Безумие - Потерять рассудок полностью',
    'all_rooms': 'Исследователь - Посетить все комнаты',
    'puzzle_master': 'Мастер загадок - Решить все головоломки',
    'secret_finder': 'Хранитель тайн - Найти все секреты'
  };

  // Инициализация головоломок
  useEffect(() => {
    const puzzles = {
      'Библиотека': {
        description: 'На полке лежит древняя книга с загадкой: "Что исчезает, когда произносишь его имя?"',
        solved: false,
        solution: 'тишина',
        reward: 'Магический амулет'
      },
      'Алхимическая лаборатория': {
        description: 'Формула на доске требует особого ингредиента. Смешайте огонь и воду.',
        solved: false,
        solution: 'пар',
        reward: 'Эликсир восстановления'
      },
      'Склеп': {
        description: 'Эпитафия гласит: "Укажи количество шагов от входа до вечного покоя."',
        solved: false,
        solution: '13',
        reward: 'Ключ от башни'
      }
    };
    setRoomPuzzles(puzzles);
  }, []);

  // Эффекты галлюцинаций и фоновая музыка
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.sanity < 50 && Math.random() < 0.3) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 500);
        
        // Случайные галлюцинации
        if (Math.random() < 0.1) {
          triggerHallucination();
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [gameState.sanity]);

  // Фоновая музыка
  useEffect(() => {
    if (gameState.musicEnabled && isPlaying) {
      playAmbientMusic();
    } else {
      stopAmbientMusic();
    }
    return () => stopAmbientMusic();
  }, [gameState.musicEnabled, isPlaying]);

  const playAmbientMusic = () => {
    if (!ambientAudioRef.current) {
      // В реальном проекте здесь был бы файл музыки
      // ambientAudioRef.current = new Audio('/sounds/ambient-horror.mp3');
      // ambientAudioRef.current.loop = true;
      // ambientAudioRef.current.volume = musicVolume / 100;
      // ambientAudioRef.current.play();
    }
  };

  const stopAmbientMusic = () => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }
  };

  const playSound = (soundType: string) => {
    if (gameState.soundEnabled) {
      // В реальном проекте здесь были бы звуковые эффекты
      console.log(`Playing sound: ${soundType}`);
    }
  };

  const triggerHallucination = () => {
    const hallucinations = [
      "Вам кажется, что стены двигаются...",
      "Вы слышите шаги за спиной, но никого нет...",
      "Тени принимают человеческие формы...",
      "Ваше отражение моргает независимо от вас..."
    ];
    
    const randomHallucination = hallucinations[Math.floor(Math.random() * hallucinations.length)];
    setCurrentDialog(randomHallucination);
    
    setTimeout(() => {
      setCurrentDialog(null);
    }, 3000);
  };

  const unlockAchievement = (achievementKey: string) => {
    if (!gameState.achievements.includes(achievementKey)) {
      setGameState(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementKey]
      }));
      
      setShowAchievement(achievements[achievementKey as keyof typeof achievements]);
      setTimeout(() => setShowAchievement(null), 3000);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setSelectedTab('game');
    playSound('game_start');
  };

  const moveToRoom = (room: string) => {
    playSound('footsteps');
    
    setGameState(prev => {
      const newSanityLoss = Math.random() > 0.5 ? 3 : 7;
      const newSanity = Math.max(prev.sanity - newSanityLoss, 0);
      
      // Проверка достижений
      const visitedRooms = [...new Set([...prev.discoveredSecrets, room])];
      if (visitedRooms.length === rooms.length) {
        unlockAchievement('all_rooms');
      }
      
      if (newSanity === 0) {
        unlockAchievement('sanity_zero');
      }
      
      return {
        ...prev,
        location: room,
        sanity: newSanity,
        currentStory: Math.min(prev.currentStory + 1, storySegments.length - 1),
        discoveredSecrets: visitedRooms
      };
    });

    // Диалоги для разных комнат
    if (room === 'Башня' && gameState.inventory.includes('Ключ от башни')) {
      showRoomDialog(room);
    }
  };

  const showRoomDialog = (room: string) => {
    let dialogText = "";
    let choices: DialogChoice[] = [];

    switch (room) {
      case 'Башня':
        dialogText = "Вы поднялись на вершину башни. Отсюда видна вся проклятая земля. В центре стоит древний алтарь.";
        choices = [
          {
            text: "Приблизиться к алтарю",
            effect: () => {
              setGameState(prev => ({ ...prev, sanity: prev.sanity - 15 }));
              setCurrentDialog("Алтарь излучает тьму. Вы чувствуете, как она проникает в вашу душу...");
            }
          },
          {
            text: "Спуститься обратно",
            effect: () => {
              moveToRoom('Главная комната');
              setCurrentDialog(null);
            }
          }
        ];
        break;
      
      case 'Склеп':
        dialogText = "В склепе вы находите древние записи. Они рассказывают историю этого проклятого места.";
        choices = [
          {
            text: "Прочитать записи",
            effect: () => {
              setGameState(prev => ({ 
                ...prev, 
                sanity: prev.sanity - 10,
                currentStory: Math.min(prev.currentStory + 2, storySegments.length - 1)
              }));
              setCurrentDialog("Правда ужаснее любых кошмаров. Теперь вы знаете, что произошло здесь...");
            }
          },
          {
            text: "Уйти, не читая",
            effect: () => {
              setCurrentDialog(null);
            }
          }
        ];
        break;
    }

    setCurrentDialog(dialogText);
    setDialogChoices(choices);
  };

  const solvePuzzle = (room: string, answer: string) => {
    const puzzle = roomPuzzles[room];
    if (puzzle && answer.toLowerCase() === puzzle.solution.toLowerCase()) {
      playSound('puzzle_solved');
      
      setRoomPuzzles(prev => ({
        ...prev,
        [room]: { ...puzzle, solved: true }
      }));
      
      setGameState(prev => ({
        ...prev,
        inventory: [...prev.inventory, puzzle.reward],
        sanity: Math.min(prev.sanity + 15, 100),
        completedPuzzles: [...prev.completedPuzzles, room]
      }));
      
      if (gameState.completedPuzzles.length + 1 >= 3) {
        unlockAchievement('puzzle_master');
      }
      
      return true;
    }
    return false;
  };

  const useItem = (item: string) => {
    playSound('item_use');
    
    switch (item) {
      case 'Свеча':
        setGameState(prev => ({
          ...prev,
          sanity: Math.min(prev.sanity + 10, 100),
          inventory: prev.inventory.filter(i => i !== item)
        }));
        break;
      
      case 'Эликсир восстановления':
        setGameState(prev => ({
          ...prev,
          health: Math.min(prev.health + 30, 100),
          sanity: Math.min(prev.sanity + 20, 100),
          inventory: prev.inventory.filter(i => i !== item)
        }));
        break;
      
      case 'Магический амулет':
        setGameState(prev => ({
          ...prev,
          sanity: Math.min(prev.sanity + 25, 100),
          inventory: prev.inventory.filter(i => i !== item)
        }));
        break;
    }
  };

  const getCurrentRoomImage = () => {
    switch (gameState.location) {
      case 'Библиотека':
        return '/img/c8a5aec7-6c1a-4144-a8a1-eb1b47d701a5.jpg';
      case 'Подвал':
      case 'Склеп':
        return '/img/5dc2f05f-34e9-4070-a4c2-1be8bea99573.jpg';
      default:
        return '/img/ea697fff-51ad-41b8-82b3-748d1fb6930e.jpg';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-shadow-black via-blood-red to-gothic-gray text-bone-white transition-all duration-500 ${glitchEffect ? 'animate-pulse brightness-150 contrast-200' : ''}`}>
      {/* Background Image */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url("${getCurrentRoomImage()}")`,
          filter: gameState.sanity < 30 ? 'hue-rotate(180deg) saturate(150%)' : 'none'
        }}
      />
      
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Alert className="bg-deep-crimson border-bone-white">
            <Icon name="Trophy" className="h-4 w-4" />
            <AlertDescription className="text-bone-white font-bold">
              Достижение разблокировано: {showAchievement}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Dialog Modal */}
      {currentDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <Card className="bg-gothic-gray border-deep-crimson p-6 max-w-md mx-4">
            <p className="text-bone-white mb-4">{currentDialog}</p>
            {dialogChoices.length > 0 ? (
              <div className="space-y-2">
                {dialogChoices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      choice.effect();
                      setDialogChoices([]);
                    }}
                    className="w-full bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white"
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                onClick={() => setCurrentDialog(null)}
                className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white"
              >
                Продолжить
              </Button>
            )}
          </Card>
        </div>
      )}
      
      <div className="relative z-10 container mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gothic-gray/50 border border-deep-crimson">
            <TabsTrigger value="menu" className="text-bone-white data-[state=active]:bg-deep-crimson">Меню</TabsTrigger>
            <TabsTrigger value="game" className="text-bone-white data-[state=active]:bg-deep-crimson">Игра</TabsTrigger>
            <TabsTrigger value="character" className="text-bone-white data-[state=active]:bg-deep-crimson">Персонаж</TabsTrigger>
            <TabsTrigger value="inventory" className="text-bone-white data-[state=active]:bg-deep-crimson">Инвентарь</TabsTrigger>
            <TabsTrigger value="achievements" className="text-bone-white data-[state=active]:bg-deep-crimson">Достижения</TabsTrigger>
            <TabsTrigger value="settings" className="text-bone-white data-[state=active]:bg-deep-crimson">Настройки</TabsTrigger>
          </TabsList>

          {/* Главное меню */}
          <TabsContent value="menu" className="space-y-6">
            <div className="text-center space-y-8 pt-12">
              <h1 className="text-6xl font-bold tracking-wider text-deep-crimson drop-shadow-lg animate-pulse" 
                  style={{ fontFamily: 'Creepster, cursive' }}>
                ТЕНИ РАЗУМА
              </h1>
              <p className="text-xl text-bone-white/80 max-w-2xl mx-auto leading-relaxed">
                Психологический хоррор, где грань между реальностью и кошмаром стирается с каждым шагом.
                Исследуйте проклятый особняк, решайте загадки и сохраните рассудок.
              </p>
              
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button 
                  onClick={startGame}
                  className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white text-lg py-6 border-2 border-bone-white/20 hover:scale-105 transition-transform"
                >
                  <Icon name="Play" className="mr-2" size={20} />
                  НАЧАТЬ ИГРУ
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-deep-crimson text-bone-white hover:bg-deep-crimson/20 text-lg py-6 hover:scale-105 transition-transform"
                >
                  <Icon name="Save" className="mr-2" size={20} />
                  ЗАГРУЗИТЬ
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-bone-white hover:bg-gothic-gray/50 text-lg py-6 hover:scale-105 transition-transform"
                  onClick={() => setSelectedTab('achievements')}
                >
                  <Icon name="Trophy" className="mr-2" size={20} />
                  ДОСТИЖЕНИЯ
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-bone-white hover:bg-gothic-gray/50 text-lg py-6 hover:scale-105 transition-transform"
                  onClick={() => setSelectedTab('settings')}
                >
                  <Icon name="Settings" className="mr-2" size={20} />
                  НАСТРОЙКИ
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Основная игровая область */}
          <TabsContent value="game" className="space-y-6">
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6 hover:bg-gothic-gray/60 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-deep-crimson">
                  <Icon name="MapPin" className="inline mr-2" size={24} />
                  {gameState.location}
                </h2>
                <Badge variant="outline" className="border-deep-crimson text-bone-white">
                  Глава {gameState.chapter}
                </Badge>
              </div>
              
              <div className="mb-6 p-4 bg-shadow-black/50 rounded-lg border border-deep-crimson/30">
                <p className="text-bone-white/90 leading-relaxed text-lg mb-2">
                  {storySegments[Math.min(gameState.currentStory, storySegments.length - 1)]}
                </p>
                <p className="text-bone-white/70 text-sm">
                  {roomDescriptions[gameState.location as keyof typeof roomDescriptions]}
                </p>
              </div>

              {/* Головоломка для текущей комнаты */}
              {roomPuzzles[gameState.location] && !roomPuzzles[gameState.location].solved && (
                <Card className="bg-shadow-black/30 border border-deep-crimson/50 p-4 mb-6">
                  <h4 className="text-deep-crimson font-semibold mb-2">
                    <Icon name="HelpCircle" className="inline mr-1" size={16} />
                    Загадка
                  </h4>
                  <p className="text-bone-white/90 mb-3">
                    {roomPuzzles[gameState.location].description}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Введите ответ..."
                      className="flex-1 bg-gothic-gray border border-deep-crimson rounded px-3 py-2 text-bone-white placeholder-bone-white/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (solvePuzzle(gameState.location, input.value)) {
                            input.value = '';
                          } else {
                            input.style.borderColor = '#ff0000';
                            setTimeout(() => input.style.borderColor = '#8B0000', 1000);
                          }
                        }
                      }}
                    />
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {rooms.map((room) => (
                  <Button
                    key={room}
                    onClick={() => moveToRoom(room)}
                    variant={gameState.location === room ? "default" : "outline"}
                    className={`p-4 h-auto hover:scale-105 transition-transform ${
                      gameState.location === room 
                        ? 'bg-deep-crimson text-bone-white shadow-lg shadow-deep-crimson/50' 
                        : 'border-deep-crimson text-bone-white hover:bg-deep-crimson/20'
                    }`}
                    disabled={gameState.health <= 0}
                  >
                    <Icon name="Door" className="mr-2" size={18} />
                    {room}
                    {gameState.discoveredSecrets.includes(room) && (
                      <Icon name="Check" className="ml-2" size={14} />
                    )}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-all"
                  onClick={() => {
                    playSound('search');
                    const discoveries = ['Вы нашли монету в щели стены', 'Здесь ничего интересного', 'Странные царапины на полу', 'Слабый запах серы'];
                    const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
                    setCurrentDialog(discovery);
                  }}
                >
                  <Icon name="Search" className="mr-2" size={16} />
                  Осмотреться
                </Button>
                <Button 
                  className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-all"
                  onClick={() => {
                    playSound('ambient');
                    const sounds = ['Вы слышите далекий шепот', 'Тишина давит на уши', 'Скрип старого дерева', 'Чей-то стон эхом разносится по дому'];
                    const sound = sounds[Math.floor(Math.random() * sounds.length)];
                    setCurrentDialog(sound);
                  }}
                >
                  <Icon name="Ear" className="mr-2" size={16} />
                  Прислушаться
                </Button>
                <Button 
                  className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-all"
                  onClick={() => showRoomDialog(gameState.location)}
                >
                  <Icon name="Eye" className="mr-2" size={16} />
                  Исследовать
                </Button>
                <Button 
                  className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-all"
                  onClick={() => {
                    playSound('rest');
                    setGameState(prev => ({
                      ...prev,
                      health: Math.min(prev.health + 5, 100),
                      sanity: Math.max(prev.sanity - 2, 0)
                    }));
                    setCurrentDialog('Вы немного отдохнули, но беспокойство не покидает вас...');
                  }}
                >
                  <Icon name="Pause" className="mr-2" size={16} />
                  Отдохнуть
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Информация о персонаже */}
          <TabsContent value="character" className="space-y-6">
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-deep-crimson mb-4">Состояние персонажа</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-bone-white">Здоровье</span>
                        <span className={`${gameState.health < 30 ? 'text-deep-crimson animate-pulse' : 'text-bone-white'}`}>
                          {gameState.health}%
                        </span>
                      </div>
                      <Progress value={gameState.health} className="h-3 bg-shadow-black" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-bone-white">Рассудок</span>
                        <span className={`${gameState.sanity < 30 ? 'text-deep-crimson animate-pulse' : 'text-bone-white'}`}>
                          {gameState.sanity}%
                        </span>
                      </div>
                      <Progress 
                        value={gameState.sanity} 
                        className={`h-3 bg-shadow-black ${gameState.sanity < 30 ? 'animate-pulse' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-bone-white">Прогресс исследования</span>
                        <span className="text-bone-white">
                          {gameState.discoveredSecrets.length}/{rooms.length}
                        </span>
                      </div>
                      <Progress 
                        value={(gameState.discoveredSecrets.length / rooms.length) * 100} 
                        className="h-3 bg-shadow-black"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-deep-crimson mb-2">Эффекты</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.sanity < 50 && (
                        <Badge variant="destructive" className="bg-deep-crimson/20 border-deep-crimson animate-pulse">
                          <Icon name="Brain" className="mr-1" size={14} />
                          Галлюцинации
                        </Badge>
                      )}
                      {gameState.health < 30 && (
                        <Badge variant="destructive" className="bg-deep-crimson/20 border-deep-crimson animate-pulse">
                          <Icon name="Heart" className="mr-1" size={14} />
                          Ранен
                        </Badge>
                      )}
                      {gameState.sanity < 20 && (
                        <Badge variant="destructive" className="bg-deep-crimson/20 border-deep-crimson animate-pulse">
                          <Icon name="Zap" className="mr-1" size={14} />
                          Помутнение рассудка
                        </Badge>
                      )}
                      {gameState.completedPuzzles.length > 0 && (
                        <Badge variant="outline" className="border-deep-crimson text-bone-white">
                          <Icon name="Lightbulb" className="mr-1" size={14} />
                          Разгадчик тайн
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <img 
                    src="/img/c45eb580-c856-4c74-9b57-d3361d627bae.jpg"
                    alt="Character Portrait"
                    className={`w-64 h-64 rounded-lg border-2 border-deep-crimson object-cover transition-all duration-500 ${
                      gameState.sanity < 30 ? 'sepia saturate-0 contrast-150' : ''
                    }`}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Система предметов */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6">
              <h3 className="text-xl font-bold text-deep-crimson mb-4">
                <Icon name="Package" className="inline mr-2" size={24} />
                Инвентарь ({gameState.inventory.length}/10)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gameState.inventory.map((item, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-24 flex flex-col border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-all"
                      >
                        <Icon 
                          name={
                            item === 'Старый ключ' ? 'Key' :
                            item === 'Свеча' ? 'Flame' :
                            item === 'Магический амулет' ? 'Shield' :
                            item === 'Эликсир восстановления' ? 'FlaskConical' :
                            item === 'Ключ от башни' ? 'KeyRound' :
                            'Package2'
                          } 
                          size={32} 
                          className="mb-2" 
                        />
                        <span className="text-xs text-center">{item}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gothic-gray border-deep-crimson">
                      <DialogHeader>
                        <DialogTitle className="text-deep-crimson">{item}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-bone-white">
                          {item === 'Старый ключ' && 'Тяжелый железный ключ, покрытый ржавчиной. Открывает старые двери.'}
                          {item === 'Свеча' && 'Восковая свеча, дающая слабый свет. Успокаивает нервы и восстанавливает рассудок.'}
                          {item === 'Магический амулет' && 'Древний амулет, пульсирующий мистической энергией. Защищает от темных сил.'}
                          {item === 'Эликсир восстановления' && 'Таинственное зелье, восстанавливающее здоровье и ясность ума.'}
                          {item === 'Ключ от башни' && 'Особый ключ, открывающий путь к вершине башни. Излучает слабое свечение.'}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => useItem(item)}
                            className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white"
                            disabled={item === 'Старый ключ' || item === 'Ключ от башни'}
                          >
                            Использовать
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-deep-crimson text-bone-white hover:bg-deep-crimson/20"
                          >
                            Осмотреть
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
                
                {/* Пустые слоты */}
                {Array.from({ length: Math.max(0, 10 - gameState.inventory.length) }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="h-24 border-2 border-dashed border-deep-crimson/30 rounded flex items-center justify-center"
                  >
                    <Icon name="Package" className="text-deep-crimson/30" size={24} />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Достижения */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6">
              <h3 className="text-xl font-bold text-deep-crimson mb-4">
                <Icon name="Trophy" className="inline mr-2" size={24} />
                Достижения ({gameState.achievements.length}/{Object.keys(achievements).length})
              </h3>
              
              <div className="grid gap-4">
                {Object.entries(achievements).map(([key, title]) => {
                  const unlocked = gameState.achievements.includes(key);
                  return (
                    <div 
                      key={key}
                      className={`p-4 border rounded-lg transition-all ${
                        unlocked 
                          ? 'border-deep-crimson bg-deep-crimson/10' 
                          : 'border-deep-crimson/30 bg-gothic-gray/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          name={unlocked ? "Trophy" : "Lock"} 
                          className={unlocked ? "text-deep-crimson" : "text-deep-crimson/30"} 
                          size={24} 
                        />
                        <div>
                          <h4 className={`font-semibold ${unlocked ? 'text-deep-crimson' : 'text-bone-white/50'}`}>
                            {title}
                          </h4>
                          <p className={`text-sm ${unlocked ? 'text-bone-white' : 'text-bone-white/30'}`}>
                            {unlocked ? 'Разблокировано!' : 'Заблокировано'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6">
              <h3 className="text-xl font-bold text-deep-crimson mb-6">
                <Icon name="Settings" className="inline mr-2" size={24} />
                Настройки игры
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-bone-white">Громкость звука</span>
                    <span className="text-bone-white/70">{soundVolume}%</span>
                  </div>
                  <Slider
                    value={[soundVolume]}
                    onValueChange={(value) => setSoundVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-bone-white">Громкость музыки</span>
                    <span className="text-bone-white/70">{musicVolume}%</span>
                  </div>
                  <Slider
                    value={[musicVolume]}
                    onValueChange={(value) => setMusicVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Звуковые эффекты</span>
                  <Switch
                    checked={gameState.soundEnabled}
                    onCheckedChange={(checked) => 
                      setGameState(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Фоновая музыка</span>
                  <Switch
                    checked={gameState.musicEnabled}
                    onCheckedChange={(checked) => 
                      setGameState(prev => ({ ...prev, musicEnabled: checked }))
                    }
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Эффекты искажения</span>
                  <Badge variant="outline" className="border-deep-crimson text-bone-white">ВКЛ</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Автосохранение</span>
                  <Badge variant="outline" className="border-deep-crimson text-bone-white">ВКЛ</Badge>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <Button className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white hover:scale-105 transition-transform">
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить игру
                </Button>
                <Button 
                  variant="outline" 
                  className="border-deep-crimson text-bone-white hover:bg-deep-crimson/20 hover:scale-105 transition-transform"
                  onClick={() => {
                    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
                      setGameState({
                        health: 100,
                        sanity: 85,
                        location: 'Главная комната',
                        inventory: ['Старый ключ', 'Свеча'],
                        currentStory: 0,
                        chapter: 1,
                        achievements: [],
                        soundEnabled: true,
                        musicEnabled: true,
                        completedPuzzles: [],
                        discoveredSecrets: []
                      });
                    }
                  }}
                >
                  <Icon name="RotateCcw" className="mr-2" size={16} />
                  Сбросить прогресс
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HorrorGame;