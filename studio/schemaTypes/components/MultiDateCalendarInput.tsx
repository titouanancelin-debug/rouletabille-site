import { useCallback } from 'react';
import { set, unset, type ArrayOfPrimitivesInputProps } from 'sanity';
import { Card, Stack, Text } from '@sanity/ui';
import { Calendar, type DateObject } from 'react-multi-date-picker';

// Un seul calendrier où on coche les dates ponctuelles d'un atelier, plutôt
// que d'ajouter les entrées une par une avec le widget "array of date" par
// défaut de Sanity (une popup calendrier par clic sur "+ Add item").
export function MultiDateCalendarInput(props: ArrayOfPrimitivesInputProps<string>) {
  const { value = [], onChange } = props;

  const handleChange = useCallback(
    (selected: DateObject | DateObject[] | null) => {
      const list = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const isoDates = list.map((d) => d.format('YYYY-MM-DD')).sort();
      onChange(isoDates.length ? set(isoDates) : unset());
    },
    [onChange]
  );

  return (
    <Stack space={3}>
      <Card border radius={2} padding={2} tone="transparent">
        <Calendar multiple value={value} onChange={handleChange} format="YYYY-MM-DD" />
      </Card>
      <Text size={1} muted>
        {value.length === 0
          ? 'Aucune date sélectionnée — cliquer les jours sur le calendrier.'
          : `${value.length} date${value.length > 1 ? 's' : ''} sélectionnée${value.length > 1 ? 's' : ''} : ${[...value].sort().join(', ')}`}
      </Text>
    </Stack>
  );
}
