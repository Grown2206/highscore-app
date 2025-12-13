import { Zap, Wind, Flame, Star, Clock, Activity, Calendar, Moon, Leaf, CalendarDays, Shield, Tag, Gem, Trophy, TrendingUp, Target, Award, Crown, Rocket, Sparkles, Heart, Brain, Smile, Coffee, Sun, Sunset, CloudRain, Music, Book, Gamepad, Camera, Gift, Milestone, Layers, Percent, DollarSign, Save, TrendingDown, Repeat, Users, MapPin, Thermometer, Battery, Timer } from 'lucide-react';

export const ALL_ACHIEVEMENTS = [
  // Basis Erfolge (1-10)
  { id: 'first_blood', title: 'Erster Zug', desc: 'Starte deine erste Session.', Icon: Zap },
  { id: 'baby_steps', title: 'Baby Steps', desc: 'Erreiche 3 Hits gesamt.', Icon: Smile },
  { id: 'getting_started', title: 'Getting Started', desc: 'Erreiche 10 Hits gesamt.', Icon: Target },
  { id: 'committed', title: 'Committed', desc: 'Erreiche 25 Hits gesamt.', Icon: Award },
  { id: 'half_century', title: 'Half Century', desc: 'Erreiche 50 Hits gesamt.', Icon: Star },
  { id: 'century_club', title: 'Century Club', desc: 'Erreiche 100 Hits gesamt.', Icon: Trophy },
  { id: 'veteran', title: 'Veteran', desc: 'Erreiche 250 Hits gesamt.', Icon: Crown },
  { id: 'legend', title: 'Legende', desc: 'Erreiche 500 Hits gesamt.', Icon: Rocket },
  { id: 'ultimate', title: 'Ultimate', desc: 'Erreiche 1000 Hits gesamt.', Icon: Sparkles },
  { id: 'unstoppable', title: 'Unstoppable', desc: 'Erreiche 2500 Hits gesamt.', Icon: Flame },

  // Tages-Erfolge (11-20)
  { id: 'high_five', title: 'High Five', desc: 'Erreiche 5 Hits an einem Tag.', Icon: Wind },
  { id: 'stoner', title: 'Heavy User', desc: 'Erreiche 10 Hits an einem Tag.', Icon: Flame },
  { id: 'party_mode', title: 'Party Mode', desc: 'Erreiche 15 Hits an einem Tag.', Icon: Music },
  { id: 'insane', title: 'Insane', desc: 'Erreiche 20 Hits an einem Tag.', Icon: Brain },
  { id: 'legendary_day', title: 'Legendärer Tag', desc: 'Erreiche 30 Hits an einem Tag.', Icon: Crown },
  { id: 'chill_day', title: 'Chill Day', desc: 'Genau 1 Hit an einem Tag.', Icon: Sunset },
  { id: 'balanced', title: 'Ausgewogen', desc: 'Genau 3 Hits an einem Tag.', Icon: Heart },
  { id: 'weekend_warrior', title: 'Weekend Warrior', desc: '10+ Hits an einem Wochenendtag.', Icon: CalendarDays },
  { id: 'monday_blues', title: 'Monday Blues', desc: 'Ein Hit an einem Montag.', Icon: Coffee },
  { id: 'sunday_driver', title: 'Sonntagsfahrer', desc: 'Ein Hit an einem Sonntag.', Icon: Sun },

  // Zeit-Erfolge (21-30)
  { id: 'rapid_fire', title: 'Schnellfeuer', desc: '2 Hits innerhalb von 5 Minuten.', Icon: Clock },
  { id: 'hattrick', title: 'Hattrick', desc: '3 Hits innerhalb von 15 Minuten.', Icon: Activity },
  { id: 'chain_smoker', title: 'Chain Smoker', desc: '5 Hits innerhalb von 30 Minuten.', Icon: Timer },
  { id: 'early_bird', title: 'Early Bird', desc: 'Ein Hit vor 08:00 Uhr.', Icon: Calendar },
  { id: 'night_owl', title: 'Nachteule', desc: 'Ein Hit zwischen 02:00 und 05:00 Uhr.', Icon: Moon },
  { id: '420', title: 'It\'s 4:20!', desc: 'Ein Hit exakt um 16:20 Uhr.', Icon: Leaf },
  { id: 'midnight_toker', title: 'Midnight Toker', desc: 'Ein Hit exakt um 00:00 Uhr.', Icon: Clock },
  { id: 'lunch_break', title: 'Lunch Break', desc: 'Ein Hit zwischen 12:00 und 13:00 Uhr.', Icon: Coffee },
  { id: 'golden_hour', title: 'Golden Hour', desc: 'Ein Hit zwischen 17:00 und 19:00 Uhr.', Icon: Sunset },
  { id: 'all_nighter', title: 'All Nighter', desc: 'Hits in jeder Stunde von 22-06 Uhr.', Icon: Moon },

  // Streak-Erfolge (31-37)
  { id: 'consistency', title: 'Konsistenz', desc: '3 Tage in Folge eine Session.', Icon: TrendingUp },
  { id: 'dedication', title: 'Hingabe', desc: '5 Tage in Folge eine Session.', Icon: Target },
  { id: 'marathon', title: 'Marathon', desc: '7 Tage in Folge eine Session.', Icon: Award },
  { id: 'champion', title: 'Champion', desc: '14 Tage in Folge eine Session.', Icon: Trophy },
  { id: 't_break', title: 'T-Break', desc: 'Über 24 Stunden Pause gemacht.', Icon: Shield },
  { id: 'detox_king', title: 'Detox King', desc: 'Über 5 Tage Pause durchgehalten.', Icon: Shield },
  { id: 'self_control', title: 'Selbstkontrolle', desc: 'Über 14 Tage Pause durchgehalten.', Icon: Brain },

  // Sorten-Erfolge (38-43)
  { id: 'first_strain', title: 'Erste Sorte', desc: 'Füge deine erste Sorte hinzu.', Icon: Tag },
  { id: 'connoisseur', title: 'Connoisseur', desc: 'Probiere 3 verschiedene Sorten.', Icon: Tag },
  { id: 'explorer', title: 'Sorten-Entdecker', desc: '5 verschiedene Sorten probiert.', Icon: Gem },
  { id: 'collector', title: 'Collector', desc: '10 verschiedene Sorten im Tagebuch.', Icon: Book },
  { id: 'master', title: 'Strain Master', desc: '20 verschiedene Sorten probiert.', Icon: Crown },
  { id: 'high_roller', title: 'High Roller', desc: 'Gönn dir eine Sorte > 15€/g.', Icon: DollarSign },

  // Spezial-Erfolge (44-50)
  { id: 'iron_lung', title: 'Iron Lung', desc: 'Ein Zug länger als 5 Sekunden.', Icon: Thermometer },
  { id: 'dragon', title: 'Drache', desc: 'Ein Zug länger als 10 Sekunden.', Icon: Flame },
  { id: 'cheapskate', title: 'Sparfuchs', desc: 'Nutze nur Sorten unter 8€/g für 10 Sessions.', Icon: Save },
  { id: 'big_spender', title: 'Big Spender', desc: 'Gib über 100€ gesamt aus.', Icon: DollarSign },
  { id: 'rainy_day', title: 'Regentag', desc: 'Eine Session bei Regen (manuell).', Icon: CloudRain },
  { id: 'birthday', title: 'Happy Birthday', desc: 'Eine Session an deinem Geburtstag.', Icon: Gift },
  { id: 'perfect_week', title: 'Perfekte Woche', desc: 'Jeden Tag genau 3 Hits für 7 Tage.', Icon: Layers },
];
