library(readr)
library(tidyverse)

data <- read_csv("../data/COMPLETE_atus_data.csv")

## drop unnecessary vars
data <- data %>%
  select(-c(PERNUM, LINENO, WT06))

## recode demographics
data <- data %>%
  mutate(
    race_general = case_when(
      RACE == 0100 ~ "White",
      RACE == 0110 ~ "Black",
      RACE == 0120 ~ "Native American",
      RACE == 0130 ~ "Asian",
      RACE == 0131 ~ "Asian",
      TRUE ~ "Mixed Race"
    ),
    hispanic = case_when(
      HISPAN != 100 & HISPAN != 9999 ~ "Hispanic",
      TRUE ~ "non-Hispanic"
    ),
    sex = case_when(
      SEX == 1 ~ "Man",
      SEX == 2 ~ "Woman"
    ),
    marriage = case_when(
      MARST %in% c(1:2) ~ "Married",
      MARST == 03 ~ "Widowed",
      MARST == 04 ~ "Divorced",
      MARST == 05 ~ "Divorced",
      MARST == 06 ~ "Unmarried"
    ),
    age_cat = case_when(
      AGE %in% c(0:17) ~ "0 and 17",
      AGE %in% c(18:22) ~ "18 and 22",
      AGE %in% c(23:29) ~ "23 and 29",
      AGE %in% c(30:39) ~ "30 and 39",
      AGE %in% c(40:49) ~ "40 and 49",
      AGE %in% c(50:59) ~ "50 and 59",
      AGE >= 60 ~ "60+"
    )
  )

## recode activities
source("big_activity_table.R")

## create time variable.
data <- data %>%
  mutate(start_time = as.numeric(START),
         stop_time = as.numeric(STOP))

data <- data %>%
  # start time is the beginning of the hour
  # if person spends > 30 minutes, count as an hour
  mutate(hour_start = floor(start_time / 3600),
         hour_stop = round(stop_time / 3600)) %>%
  mutate(
    time_on_activity = (stop_time - start_time) / 3600,
    hours_on_activity = round(time_on_activity)
  )

## convert into long data, where each row corresponds to a given "hour"
## e.g. 'hour 4' represents what a given person (rowwise) was doing at 4 am.
# long_data <- data %>%
#   # for testing: slice(1:5000) %>%
#   rowwise() %>%
#   mutate(hour = list(seq(hour_start, hour_stop))) %>%
#   unnest(hour)

## write
# activity_data <- long_data %>%
#   filter(activity_general != "Unable to Code", activity_specific != "Sleeping") %>%
#   group_by(race_general, sex, marriage, age_cat, hour, activity_general, activity_specific) %>%
#   count(activity_general, activity_specific) %>%
#   top_n(3) %>% arrange(desc(n))

# write.csv(activity_data, "../data/activity_data.csv")
