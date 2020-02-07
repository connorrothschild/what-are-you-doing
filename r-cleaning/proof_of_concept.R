## proof of concept function. this could also be made into a shiny app
proof_of_concept <- function(race_general, sex, marriage, age_cat, hour, activity_specific) {
  top_activity <- long_data %>%
    group_by(race_general, sex, marriage, age_cat, hour, activity_general, activity_specific) %>%
    count(activity_general, activity_specific) %>%
    arrange(desc(n)) %>%
    filter(
      race_general == race_general,
      sex == sex,
      marriage == marriage,
      age_cat == age_cat,
      hour == hour,
      activity_specific != "Sleeping"
    ) %>%
    head(1) %>% pull(var = activity_general)
  
  top_activity_specific <- long_data %>%
    group_by(race_general, sex, marriage, age_cat, hour, activity_general, activity_specific) %>%
    count(activity_general, activity_specific) %>%
    arrange(desc(n)) %>%
    filter(
      race_general == race_general,
      sex == sex,
      marriage == marriage,
      age_cat == age_cat,
      hour == hour,
      activity_specific != "Sleeping"
    ) %>%
    head(1) %>% pull(var = activity_specific)
  
  return(
    paste0(
      "Hmm, are you ",
      stringr::str_to_lower(top_activity),
      "? More specifically, are you ",
      stringr::str_to_lower(top_activity_specific),
      "?"
    )
  )
}

proof_of_concept("White only", "Male", "Never married", "18 to 22", 22)
## A white male, not married, aged 18 to 22, at 10pm is most likely to be engaging in...
## socializing, relaxing, and leisure