export interface UserDietaryPreferencesDto {
  avoidGluten: boolean;
  avoidLactose: boolean;
  avoidNuts: boolean;
  isVegan: boolean;
}

export interface UpdateUserDietaryPreferencesRequestDto {
  avoidGluten?: boolean | null;
  avoidLactose?: boolean | null;
  avoidNuts?: boolean | null;
  isVegan?: boolean | null;
}
