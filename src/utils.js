export const checkForExpiringSubscriptions = (subscriptions) => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
  
    for (let subscription of subscriptions) {
      const startDate = new Date(subscription.startDate);
      const endDate = new Date(subscription.endDate);
  
      const isActive = today >= startDate && today <= endDate;
  
      if (isActive && endDate >= today && endDate <= threeDaysFromNow) {
        return subscription;
      }
    }
  
    return null;
  };
  