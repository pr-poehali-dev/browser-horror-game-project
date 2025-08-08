import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface GameState {
  health: number;
  sanity: number;
  location: string;
  inventory: string[];
  currentStory: number;
}

const HorrorGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    sanity: 85,
    location: 'Главная комната',
    inventory: ['Старый ключ', 'Свеча'],
    currentStory: 0
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTab, setSelectedTab] = useState('menu');
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Эффект галлюцинаций - случайные искажения
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.sanity < 50 && Math.random() < 0.3) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 500);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [gameState.sanity]);

  const storySegments = [
    "Вы просыпаетесь в незнакомой комнате. Воздух тяжел, а тени танцуют в углах...",
    "Скрип половиц под ногами эхом разносится по коридору. Что-то наблюдает за вами...",
    "Зеркало в конце коридора отражает не ваше лицо. Реальность начинает искажаться..."
  ];

  const rooms = [
    'Главная комната',
    'Темный коридор', 
    'Библиотека',
    'Подвал',
    'Чердак'
  ];

  const startGame = () => {
    setIsPlaying(true);
    setSelectedTab('game');
  };

  const moveToRoom = (room: string) => {
    setGameState(prev => ({
      ...prev,
      location: room,
      sanity: prev.sanity - 5
    }));
  };

  const useItem = (item: string) => {
    if (item === 'Свеча') {
      setGameState(prev => ({
        ...prev,
        sanity: Math.min(prev.sanity + 10, 100),
        inventory: prev.inventory.filter(i => i !== item)
      }));
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-shadow-black via-blood-red to-gothic-gray text-bone-white ${glitchEffect ? 'animate-pulse' : ''}`}>
      {/* Background Image */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/img/ea697fff-51ad-41b8-82b3-748d1fb6930e.jpg")'
        }}
      />
      
      <div className="relative z-10 container mx-auto p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gothic-gray/50 border border-deep-crimson">
            <TabsTrigger value="menu" className="text-bone-white data-[state=active]:bg-deep-crimson">Меню</TabsTrigger>
            <TabsTrigger value="game" className="text-bone-white data-[state=active]:bg-deep-crimson">Игра</TabsTrigger>
            <TabsTrigger value="character" className="text-bone-white data-[state=active]:bg-deep-crimson">Персонаж</TabsTrigger>
            <TabsTrigger value="inventory" className="text-bone-white data-[state=active]:bg-deep-crimson">Инвентарь</TabsTrigger>
            <TabsTrigger value="settings" className="text-bone-white data-[state=active]:bg-deep-crimson">Настройки</TabsTrigger>
          </TabsList>

          {/* Главное меню */}
          <TabsContent value="menu" className="space-y-6">
            <div className="text-center space-y-8 pt-12">
              <h1 className="text-6xl font-bold tracking-wider text-deep-crimson drop-shadow-lg" 
                  style={{ fontFamily: 'Creepster, cursive' }}>
                ТЕНИ РАЗУМА
              </h1>
              <p className="text-xl text-bone-white/80 max-w-2xl mx-auto leading-relaxed">
                Психологический хоррор, где грань между реальностью и кошмаром стирается с каждым шагом
              </p>
              
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Button 
                  onClick={startGame}
                  className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white text-lg py-6 border-2 border-bone-white/20"
                >
                  <Icon name="Play" className="mr-2" size={20} />
                  НАЧАТЬ ИГРУ
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-deep-crimson text-bone-white hover:bg-deep-crimson/20 text-lg py-6"
                >
                  <Icon name="Save" className="mr-2" size={20} />
                  ЗАГРУЗИТЬ
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-bone-white hover:bg-gothic-gray/50 text-lg py-6"
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
            <Card className="bg-gothic-gray/50 border-deep-crimson p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-deep-crimson">
                  <Icon name="MapPin" className="inline mr-2" size={24} />
                  {gameState.location}
                </h2>
                <Badge variant="outline" className="border-deep-crimson text-bone-white">
                  Глава 1
                </Badge>
              </div>
              
              <div className="mb-6 p-4 bg-shadow-black/50 rounded-lg border border-deep-crimson/30">
                <p className="text-bone-white/90 leading-relaxed text-lg">
                  {storySegments[gameState.currentStory]}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {rooms.map((room) => (
                  <Button
                    key={room}
                    onClick={() => moveToRoom(room)}
                    variant={gameState.location === room ? "default" : "outline"}
                    className={`p-4 h-auto ${
                      gameState.location === room 
                        ? 'bg-deep-crimson text-bone-white' 
                        : 'border-deep-crimson text-bone-white hover:bg-deep-crimson/20'
                    }`}
                  >
                    <Icon name="Door" className="mr-2" size={18} />
                    {room}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20">
                  <Icon name="Search" className="mr-2" size={16} />
                  Осмотреться
                </Button>
                <Button className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20">
                  <Icon name="Ear" className="mr-2" size={16} />
                  Прислушаться
                </Button>
                <Button className="bg-gothic-gray border-deep-crimson text-bone-white hover:bg-deep-crimson/20">
                  <Icon name="Eye" className="mr-2" size={16} />
                  Исследовать
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
                        <span className="text-bone-white">{gameState.health}%</span>
                      </div>
                      <Progress value={gameState.health} className="h-3 bg-shadow-black" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-bone-white">Рассудок</span>
                        <span className={`${gameState.sanity < 30 ? 'text-deep-crimson' : 'text-bone-white'}`}>
                          {gameState.sanity}%
                        </span>
                      </div>
                      <Progress 
                        value={gameState.sanity} 
                        className={`h-3 bg-shadow-black ${gameState.sanity < 30 ? 'animate-pulse' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-deep-crimson mb-2">Эффекты</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.sanity < 50 && (
                        <Badge variant="destructive" className="bg-deep-crimson/20 border-deep-crimson">
                          <Icon name="Brain" className="mr-1" size={14} />
                          Галлюцинации
                        </Badge>
                      )}
                      {gameState.health < 30 && (
                        <Badge variant="destructive" className="bg-deep-crimson/20 border-deep-crimson">
                          <Icon name="Heart" className="mr-1" size={14} />
                          Ранен
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <img 
                    src="/img/c45eb580-c856-4c74-9b57-d3361d627bae.jpg"
                    alt="Character Portrait"
                    className="w-64 h-64 rounded-lg border-2 border-deep-crimson object-cover"
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
                Инвентарь
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gameState.inventory.map((item, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-24 flex flex-col border-deep-crimson text-bone-white hover:bg-deep-crimson/20"
                      >
                        <Icon name="Package2" size={32} className="mb-2" />
                        <span className="text-xs">{item}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gothic-gray border-deep-crimson">
                      <DialogHeader>
                        <DialogTitle className="text-deep-crimson">{item}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-bone-white">
                          {item === 'Старый ключ' && 'Тяжелый железный ключ, покрытый ржавчиной. Открывает старые двери.'}
                          {item === 'Свеча' && 'Восковая свеча, дающая слабый свет. Успокаивает нервы.'}
                        </p>
                        <Button 
                          onClick={() => useItem(item)}
                          className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white"
                        >
                          Использовать
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
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
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Громкость звука</span>
                  <Progress value={75} className="w-32 h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-bone-white">Громкость музыки</span>
                  <Progress value={50} className="w-32 h-2" />
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
                <Button className="bg-deep-crimson hover:bg-deep-crimson/80 text-bone-white">
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить игру
                </Button>
                <Button 
                  variant="outline" 
                  className="border-deep-crimson text-bone-white hover:bg-deep-crimson/20"
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