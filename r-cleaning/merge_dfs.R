## convert into long data, where each row corresponds to a given "hour"
## e.g. 'hour 4' represents what a given person (rowwise) was doing at 4 am.
# long_data <- data %>%
#   # for testing: slice(1:5000) %>%
#   rowwise() %>%
#   mutate(hour = list(seq(hour_start, hour_stop))) %>%
#   unnest(hour)

long_data1 <- data %>%
  slice(1:100000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data2 <- data %>%
  slice(100001:200000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data3 <- data %>%
  slice(200001:300000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data4 <- data %>%
  slice(300001:400000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data5 <- data %>%
  slice(400001:500000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data6 <- data %>%
  slice(500001:600000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data7 <- data %>%
  slice(600001:700000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data8 <- data %>%
  slice(700001:800000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data9 <- data %>%
  slice(800001:900000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data10 <- data %>%
  slice(900001:1000000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data11 <- data %>%
  slice(1000001:1100000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data12 <- data %>%
  slice(1100001:1200000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data13 <- data %>%
  slice(1200001:1300000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data14 <- data %>%
  slice(1300001:1400000) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data15 <- data %>%
  slice(1400001:1475384) %>%
  rowwise() %>%
  mutate(hour = list(seq(hour_start, hour_stop))) %>%
  unnest(hour)

long_data <- rbind(long_data1, long_data2, long_data3, long_data4, 
                   long_data5, long_data6, long_data7, long_data8, 
                   long_data9, long_data10, long_data11, long_data12,
                   long_data13, long_data14, long_data15)

## write
activity_data <- long_data %>%
  mutate(activity_general = str_replace_all(activity_general, 
                                             c("SocializingRelaxingand Leisure" = "Socializing, Relaxing, and Leisure", 
                                               "SportsExerciseand Recreation" = "Sports, Exercise, and Recreation")),
         activity_specific = str_replace_all(activity_specific, 
                                             c("Workmain job" = "Work",
                                               "rsrch/hw" = "Research/homework",
                                               "degreecertor" = "degree, certification, or",
                                               "exc. " = "excluding ",
                                               "(excluding games)" = "",
                                               "friendsneighbors" = "friends and neighbors",
                                               "trvl rel to" = "travel related to",
                                               "shoppingexcept groceriesfood and gas" = "shopping",
                                               "washingdressing" = "washing, dressing,",
                                               " (not religious)" = "",
                                               "(2008+)" = "",
                                               "(2007+)" = "",
                                               "assoc.|assoc" = "associated",
                                               "(as a primary activity)" = "",
                                               "pers. interest" = "personal interest",
                                               "hobbiescraftsand" = "hobbies, crafts, and",
                                               "maintenancerepairand" = "maintenance repair and"))) %>% 
  filter(activity_general != "Unable to Code", activity_specific != "Sleeping") %>%
  group_by(race_general, sex, marriage, age_cat, hispanic, hour, activity_general, activity_specific) %>%
  count(activity_general, activity_specific) %>%
  top_n(3) %>% arrange(desc(n))

write.csv(activity_data, "../data/activity_data.csv")
