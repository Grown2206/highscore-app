import { Zap, Wind, Flame, Star, Clock, Activity, Calendar, Moon, Leaf, CalendarDays, Shield, Tag, Gem, Trophy, TrendingUp } from 'lucide-react';

export const ALL_ACHIEVEMENTS = [
  { id: 'first_blood', title: 'Erster Zug', desc: 'Starte deine erste Session.', Icon: Zap },
  { id: 'high_five', title: 'High Five', desc: 'Erreiche 5 Hits an einem Tag.', Icon: Wind },
  { id: 'stoner', title: 'Heavy User', desc: 'Erreiche 10 Hits an einem Tag.', Icon: Flame },
  { id: 'century_club', title: 'Century Club', desc: 'Insgesamt 100 Hits erreicht.', Icon: Star },
  { id: 'rapid_fire', title: 'Schnellfeuer', desc: '2 Hits innerhalb von 5 Minuten.', Icon: Clock },
  { id: 'hattrick', title: 'Hattrick', desc: '3 Hits innerhalb von 15 Minuten.', Icon: Activity },
  { id: 'early_bird', title: 'Early Bird', desc: 'Ein Hit vor 08:00 Uhr morgens.', Icon: Calendar },
  { id: 'night_owl', title: 'Nachteule', desc: 'Ein Hit zwischen 02:00 und 05:00 Uhr.', Icon: Moon },
  { id: '420', title: 'It\'s 4:20!', desc: 'Ein Hit exakt um 16:20 Uhr.', Icon: Leaf },
  { id: 'sunday_driver', title: 'Sonntagsfahrer', desc: 'Ein entspannter Hit am Sonntag.', Icon: CalendarDays },
  { id: 't_break', title: 'T-Break', desc: 'Über 24 Stunden Pause gemacht.', Icon: Shield },
  { id: 'detox_king', title: 'Detox King', desc: 'Über 5 Tage Pause durchgehalten.', Icon: Shield },
  { id: 'connoisseur', title: 'Connoisseur', desc: 'Probiere 3 verschiedene Sorten.', Icon: Tag },
  { id: 'explorer', title: 'Sorten-Entdecker', desc: '5 verschiedene Sorten im Tagebuch.', Icon: Tag },
  { id: 'high_roller', title: 'High Roller', desc: 'Gönn dir eine Sorte > 15€/g.', Icon: Gem },
  { id: 'iron_lung', title: 'Iron Lung', desc: 'Ein Zug länger als 5 Sekunden.', Icon: Trophy },
  { id: 'marathon', title: 'Marathon', desc: '7 Tage in Folge eine Session.', Icon: TrendingUp }
];
