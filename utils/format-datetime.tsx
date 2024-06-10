import dayjs from 'dayjs';

export const formatDate = (date?: string, withTime?: boolean) => {
  if (!date) return '';
  if (withTime) {
    return dayjs(date).format('ddd, DD MMM YYYY @ h:mm:ss A');
  }
  return dayjs(date).format('ddd, DD MMM YYYY');
};
