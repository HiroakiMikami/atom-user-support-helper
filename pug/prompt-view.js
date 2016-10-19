'use babel'

export default `div(class="user-support-helper prompot-view section-container #{className}")
  div.section-heading
    a(class="pull-right close-icon")
    div.row
      h3.name= name
    div.row
      div.prompt-message= message
  div.container
    div.row
      span(class="pull-right label label-danger")
      div.input-interface
        span.input!= input
    div.row!= detail
  div.section-footer
    button(class="btn btn menu-btn" style="visibility:hidden") Dummy
    button(class="pull-right btn menu-btn prompt-finish") !{words.finish}
    button(class="pull-right btn menu-btn prompt-next") !{words.next}
    button(class="pull-right btn menu-btn prompt-skip") !{words.skip}
    button(class="pull-right btn menu-btn prompt-back") !{words.back}
`
